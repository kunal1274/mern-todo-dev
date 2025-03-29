// src/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";
// or "http://localhost:4000/api" if testing locally

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Fetch existing users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users`, { email, name });
      setEmail("");
      setName("");
      fetchUsers(); // refresh list
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>

      {/* Form */}
      <form onSubmit={createUser} className="flex items-center gap-2 mb-4">
        <input
          type="email"
          className="border border-gray-300 rounded px-2 py-1 flex-1"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1 flex-1"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </form>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Existing Users</h3>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
            >
              <div>
                <strong>{user.email}</strong>
                {user.name && (
                  <span className="ml-2 text-gray-700">({user.name})</span>
                )}
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => deleteUser(user._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsersPage;
