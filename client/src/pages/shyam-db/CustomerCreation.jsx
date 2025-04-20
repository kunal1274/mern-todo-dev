import React from "react";

export default function CustomerCreation() {
  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-700">Customer Creation</h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
          <button className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Delete
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100">
            Edit
          </button>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            placeholder="Abc Company Ltd"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select className="mt-1 block w-full rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
            <option>Manufacturing</option>
            <option>Trading</option>
            <option>Distributor</option>
            <option>Retailer</option>
            <option>Wholesaler</option>
            <option>Service Provider</option>
          </select>
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="active"
            defaultChecked
            className="rounded border-gray-300 focus:ring-blue-500 text-blue-600 mr-2"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>
      </div>

      {/* Contact Person */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="contact@email.com"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Payment & Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Credit Limit
          </label>
          <input
            type="text"
            placeholder="Net 10000"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tax Number
          </label>
          <input
            type="text"
            placeholder="AHTH5B96R"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PAN No
          </label>
          <input
            type="text"
            placeholder="JJHHJ27J3JK"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* UPI & Bank Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            UPI ID
          </label>
          <input
            type="text"
            placeholder="sid@upi"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bank
          </label>
          <input
            type="text"
            placeholder="Bank of India"
            className="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
