import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaPlus, FaEdit, FaEye } from "react-icons/fa";
// For modals and dialogs, you can use your own or a library like Headless UI, React Modal, etc.
import CompanyDeleteModal from "./CompanyDeleteModal";
import CompanyStatusModal from "./CompanyStatusModal";
import { Navigate, useNavigate } from "react-router-dom";

const mockCompanies = [
  {
    _id: "12345",
    companyCode: "ABC123",
    companyName: "Alpha Beta Corp",
    primaryGSTAddress: "123 Main St, City",
    active: true,
    archived: false,
    // ...
  },
  {
    _id: "67890",
    companyCode: "XYZ987",
    companyName: "Xyz Industries",
    primaryGSTAddress: "456 Another St, City",
    active: false,
    archived: false,
    // ...
  },
];

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // For modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch from your API or context in real app
    setCompanies(mockCompanies);
  }, []);

  // Handle single row checkbox
  const handleSelect = (id) => {
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((item) => item !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  // Handle "Select All" checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = companies.map((c) => c._id);
      setSelectedCompanies(allIds);
    } else {
      setSelectedCompanies([]);
    }
  };

  // Filtered list based on search query
  const filteredCompanies = companies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <button
          onClick={() => {
            // navigate to /companies/create
            navigate("/companies/create");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <FaPlus />
          Create Company
        </button>
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <FaSearch className="absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            className="pl-8 pr-4 py-2 border rounded w-72 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Bulk actions only if we have selected companies */}
        {selectedCompanies.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Change Status
            </button>
          </div>
        )}
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    selectedCompanies.length === companies.length &&
                    companies.length > 0
                  }
                />
              </th>
              <th className="p-3 font-medium">Company Code</th>
              <th className="p-3 font-medium">Company Name</th>
              <th className="p-3 font-medium">Primary GST Address</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => {
              const isSelected = selectedCompanies.includes(company._id);
              return (
                <tr
                  key={company._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(company._id)}
                    />
                  </td>
                  <td className="p-3">{company.companyCode}</td>
                  <td className="p-3">{company.companyName}</td>
                  <td className="p-3">{company.primaryGSTAddress}</td>
                  <td className="p-3">
                    {company.active ? (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          // navigate to /companies/:id
                          navigate("/companies/:id");
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          // navigate to /companies/:id/edit
                          navigate("/companies/:id/edit");
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompanies([company._id]);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredCompanies.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-400 italic"
                >
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <CompanyDeleteModal
          onClose={() => setShowDeleteModal(false)}
          selectedCompanyIds={selectedCompanies}
          onDeleteSuccess={() => {
            // Refresh list or remove from state
            setSelectedCompanies([]);
          }}
        />
      )}

      {showStatusModal && (
        <CompanyStatusModal
          onClose={() => setShowStatusModal(false)}
          selectedCompanyIds={selectedCompanies}
          onStatusChangeSuccess={() => {
            // Refresh list or update in state
            setSelectedCompanies([]);
          }}
        />
      )}
    </div>
  );
}
