// src/pages/Customers.jsx
import React from "react";
import { Link } from "react-router-dom";

const Customers = () => {
  // Sample data; in a real app, this would come from an API.
  const sampleCustomers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      address: "123 Main St, City",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "987-654-3210",
      address: "456 Market Rd, City",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link
          to="/customers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Customer
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="py-2 px-4 border-b">{customer.name}</td>
                <td className="py-2 px-4 border-b">{customer.email}</td>
                <td className="py-2 px-4 border-b">{customer.phone}</td>
                <td className="py-2 px-4 border-b">{customer.address}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    View
                  </Link>
                  <Link
                    to={`/customers/${customer.id}/edit`}
                    className="text-green-600 hover:underline mr-2"
                  >
                    Edit
                  </Link>
                  {/* Additional actions like Duplicate/Delete can be added here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
