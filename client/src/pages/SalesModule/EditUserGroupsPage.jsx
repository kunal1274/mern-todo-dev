// src/pages/EditUserGroup.jsx
// ADDED: A separate page to update (edit) the user group.

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";

function EditUserGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // For editing
  const [groupName, setGroupName] = useState("");
  const [owner, setOwner] = useState(null);
  const [secondOwner, setSecondOwner] = useState(null);
  const [thirdOwner, setThirdOwner] = useState(null);
  const [members, setMembers] = useState([]);

  // For typeahead
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchAllUsers();
    fetchGroup();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setAllUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/userGroups/${groupId}`);
      const g = res.data;
      setGroupName(g.name || "");
      setOwner(g.owner || null);
      setSecondOwner(g.secondOwner || null);
      setThirdOwner(g.thirdOwner || null);
      setMembers(g.members || []);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: groupName,
        owner: owner?._id || null,
        secondOwner: secondOwner?._id || null,
        thirdOwner: thirdOwner?._id || null,
        members: members.map((m) => m._id),
      };
      await axios.put(`${API_BASE_URL}/userGroups/${groupId}`, body);
      navigate(`/user-groups/${groupId}`);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  // For demonstration, let's keep it simpler than the create form:
  // We'll just show text inputs for name, owners, etc.
  // Or you could implement the same typeahead approach from the create form.

  return (
    <div className="container mx-auto max-w-xl bg-white shadow p-6 mt-4 rounded">
      <h2 className="text-2xl font-bold mb-4">Edit User Group</h2>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Group Name
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        {/* Owner (simple text for example) */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Owner</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={
              owner && (owner.name || owner.email)
                ? owner.name || owner.email
                : ""
            }
            onChange={
              (e) => setOwner({ ...owner, name: e.target.value }) // quick hack
            }
          />
        </div>

        {/* Second Owner */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Second Owner
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={
              secondOwner && (secondOwner.name || secondOwner.email)
                ? secondOwner.name || secondOwner.email
                : ""
            }
            onChange={(e) =>
              setSecondOwner({ ...secondOwner, name: e.target.value })
            }
          />
        </div>

        {/* Third Owner */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Third Owner
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={
              thirdOwner && (thirdOwner.name || thirdOwner.email)
                ? thirdOwner.name || thirdOwner.email
                : ""
            }
            onChange={(e) =>
              setThirdOwner({ ...thirdOwner, name: e.target.value })
            }
          />
        </div>

        {/* Members (just listing) */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Members
          </label>
          {members && members.length > 0 ? (
            <ul className="list-disc ml-4">
              {members.map((m) => (
                <li key={m._id}>
                  {m.name ? `${m.name} (${m.email})` : m.email}
                </li>
              ))}
            </ul>
          ) : (
            <p>No members</p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Group
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => navigate(`/user-groups/${groupId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUserGroup;
