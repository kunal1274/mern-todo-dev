// src/pages/CustomerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    // Simulate fetching data.
    // Replace this with an API call in production.
    setCustomer({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      address: "123 Main St, City",
    });
  }, [id]);

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Customer Details</h1>
      <div className="mb-2">
        <strong>Name:</strong> {customer.name}
      </div>
      <div className="mb-2">
        <strong>Email:</strong> {customer.email}
      </div>
      <div className="mb-2">
        <strong>Phone:</strong> {customer.phone}
      </div>
      <div className="mb-2">
        <strong>Address:</strong> {customer.address}
      </div>
      <Link
        to={`/customers/${customer.id}/edit`}
        className="text-blue-600 hover:underline"
      >
        Edit Customer
      </Link>
    </div>
  );
};

export default CustomerDetails;
