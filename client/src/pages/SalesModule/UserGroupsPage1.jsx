// src/pages/UserGroupsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";
// or "http://localhost:4000/api"

function UserGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [owner, setOwner] = useState("");
  const [members, setMembers] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  // GET /api/userGroups
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/userGroups`);
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // POST /api/userGroups
  // We'll let the user type comma-separated IDs for members
  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const membersArray = members
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m !== "");

      const body = {
        name: groupName,
        owner: owner || null,
        members: membersArray,
      };

      await axios.post(`${API_BASE_URL}/userGroups`, body);
      setGroupName("");
      setOwner("");
      setMembers("");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // DELETE /api/userGroups/:id
  const deleteGroup = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/userGroups/${id}`);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Manage User Groups</h2>

      {/* Create Group Form */}
      <form onSubmit={createGroup} className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="Owner User ID (optional)"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="Member IDs (comma-separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-start"
        >
          Create Group
        </button>
      </form>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Existing Groups</h3>
      {groups.length === 0 ? (
        <p className="text-gray-500">No groups found.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group._id}
              className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
            >
              <div>
                <strong>{group.name}</strong>
                {group.owner && typeof group.owner === "object" ? (
                  <span className="ml-2 text-gray-700">
                    (Owner: {group.owner.email || group.owner._id})
                  </span>
                ) : group.owner ? (
                  <span className="ml-2 text-gray-700">
                    (Owner: {group.owner})
                  </span>
                ) : null}
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => deleteGroup(group._id)}
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

export default UserGroupsPage;
