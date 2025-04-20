import React from "react";

export default function CompanyDetails({ company }) {
  if (!company) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No company data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Company Details</h1>

      {/* Basic Info */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">Basic Information</h2>
        <p>
          <strong>Company Code:</strong> {company.companyCode}
        </p>
        <p>
          <strong>Company Name:</strong> {company.companyName}
        </p>
        <p>
          <strong>Email:</strong> {company.email}
        </p>
        <p>
          <strong>Contact Number:</strong> {company.contactNumber}
        </p>
        <p>
          <strong>Website:</strong> {company.website}
        </p>
      </div>

      {/* Addresses */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium mb-2">Addresses</h2>
        <p>
          <strong>Primary GST Address:</strong> {company.primaryGSTAddress}
        </p>
        <p>
          <strong>Secondary Office Address:</strong>{" "}
          {company.secondaryOfficeAddress || "N/A"}
        </p>
        <p>
          <strong>Tertiary Shipping Address:</strong>{" "}
          {company.tertiaryShippingAddress || "N/A"}
        </p>
      </div>

      {/* Tax Info */}
      {company.taxInfo && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Tax Information</h2>
          <p>
            <strong>GST Number:</strong> {company.taxInfo.gstNumber || "N/A"}
          </p>
          <p>
            <strong>TAN Number:</strong> {company.taxInfo.tanNumber || "N/A"}
          </p>
          <p>
            <strong>PAN Number:</strong> {company.taxInfo.panNumber || "N/A"}
          </p>
        </div>
      )}

      {/* Bank Info */}
      {company.bankDetails && company.bankDetails.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-2">Bank Details</h2>
          {company.bankDetails.map((bank, index) => (
            <div key={index} className="border-b last:border-0 py-2">
              <p>
                <strong>Account Number:</strong> {bank.accountNumber}
              </p>
              <p>
                <strong>Bank Name:</strong> {bank.bankName}
              </p>
              <p>
                <strong>IFSC Code:</strong> {bank.ifscCode}
              </p>
              <p>
                <strong>SWIFT Code:</strong> {bank.swiftCode || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
