import React, { useState } from "react";

export default function CompanyForm({ isEdit, existingData, onSubmit }) {
  // For a real app, you'd parse existingData if editing.
  const [companyCode, setCompanyCode] = useState(
    existingData?.companyCode || ""
  );
  const [companyName, setCompanyName] = useState(
    existingData?.companyName || ""
  );
  const [primaryGSTAddress, setPrimaryGSTAddress] = useState(
    existingData?.primaryGSTAddress || ""
  );
  const [secondaryOfficeAddress, setSecondaryOfficeAddress] = useState(
    existingData?.secondaryOfficeAddress || ""
  );
  const [tertiaryShippingAddress, setTertiaryShippingAddress] = useState(
    existingData?.tertiaryShippingAddress || ""
  );
  const [email, setEmail] = useState(existingData?.email || "");
  const [contactNumber, setContactNumber] = useState(
    existingData?.contactNumber || ""
  );
  const [website, setWebsite] = useState(existingData?.website || "");

  // Tax Info
  const [gstNumber, setGstNumber] = useState(
    existingData?.taxInfo?.gstNumber || ""
  );
  const [tanNumber, setTanNumber] = useState(
    existingData?.taxInfo?.tanNumber || ""
  );
  const [panNumber, setPanNumber] = useState(
    existingData?.taxInfo?.panNumber || ""
  );

  // Bank Details (example with only one for brevity, but your schema can hold many)
  const [accountNumber, setAccountNumber] = useState(
    existingData?.bankDetails?.[0]?.accountNumber || ""
  );
  const [bankName, setBankName] = useState(
    existingData?.bankDetails?.[0]?.bankName || ""
  );
  const [ifscCode, setIfscCode] = useState(
    existingData?.bankDetails?.[0]?.ifscCode || ""
  );
  const [swiftCode, setSwiftCode] = useState(
    existingData?.bankDetails?.[0]?.swiftCode || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build the payload
    const payload = {
      companyCode,
      companyName,
      primaryGSTAddress,
      secondaryOfficeAddress,
      tertiaryShippingAddress,
      email,
      contactNumber,
      website,
      taxInfo: {
        gstNumber,
        tanNumber,
        panNumber,
      },
      bankDetails: [
        {
          accountNumber,
          bankName,
          ifscCode,
          swiftCode,
        },
      ],
    };
    onSubmit(payload);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {isEdit ? "Edit Company" : "Create Company"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-lg font-medium">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Code
              </label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-lg font-medium">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary GST Address
              </label>
              <input
                type="text"
                value={primaryGSTAddress}
                onChange={(e) => setPrimaryGSTAddress(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Office Address
              </label>
              <input
                type="text"
                value={secondaryOfficeAddress}
                onChange={(e) => setSecondaryOfficeAddress(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tertiary Shipping Address
              </label>
              <input
                type="text"
                value={tertiaryShippingAddress}
                onChange={(e) => setTertiaryShippingAddress(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Tax Info */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-lg font-medium">Tax Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TAN Number
              </label>
              <input
                type="text"
                value={tanNumber}
                onChange={(e) => setTanNumber(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="text-lg font-medium">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SWIFT Code
              </label>
              <input
                type="text"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
            onClick={() => {
              // navigate back or reset
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
