import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Update this to your actual API base.
 * E.g. "https://my-node-service.onrender.com/api"
 * or "http://localhost:4000/api" for local dev
 */
const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";

function UserGroupsPage() {
  // --- Data states ---
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // --- Form states ---
  const [groupName, setGroupName] = useState("");

  // For single owners (store the entire user object or null)
  const [owner, setOwner] = useState(null);
  const [typedOwner, setTypedOwner] = useState(""); // text typed in input

  const [secondOwner, setSecondOwner] = useState(null);
  const [typedSecondOwner, setTypedSecondOwner] = useState("");

  const [thirdOwner, setThirdOwner] = useState(null);
  const [typedThirdOwner, setTypedThirdOwner] = useState("");

  // For members (multi-select)
  const [members, setMembers] = useState([]); // array of user objects
  const [typedMember, setTypedMember] = useState("");

  // --- Lifecycle ---
  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  // --- API calls ---
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/userGroups`);
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setAllUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      // Convert selected user objects into IDs
      const body = {
        name: groupName,
        owner: owner?._id || null,
        secondOwner: secondOwner?._id || null,
        thirdOwner: thirdOwner?._id || null,
        members: members.map((m) => m._id),
      };

      await axios.post(`${API_BASE_URL}/userGroups`, body);
      // Clear form
      setGroupName("");
      setOwner(null);
      setTypedOwner("");
      setSecondOwner(null);
      setTypedSecondOwner("");
      setThirdOwner(null);
      setTypedThirdOwner("");
      setMembers([]);
      setTypedMember("");

      // Refresh group list
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const deleteGroup = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/userGroups/${id}`);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  // --- Typeahead logic ---
  // Filter allUsers by a typed string. We match if typed string is contained in user.email or user.name
  const filterUsers = (typed) => {
    if (!typed) return [];
    const lower = typed.toLowerCase();
    return allUsers.filter((u) => {
      const nameMatch = u.name && u.name.toLowerCase().includes(lower);
      const emailMatch = u.email && u.email.toLowerCase().includes(lower);
      return nameMatch || emailMatch;
    });
  };

  // Owner selection
  const handleSelectOwner = (user) => {
    setOwner(user);
    // Show the chosen user's name or email in the input
    setTypedOwner(user.name || user.email);
  };

  // Second owner selection
  const handleSelectSecondOwner = (user) => {
    setSecondOwner(user);
    setTypedSecondOwner(user.name || user.email);
  };

  // Third owner selection
  const handleSelectThirdOwner = (user) => {
    setThirdOwner(user);
    setTypedThirdOwner(user.name || user.email);
  };

  // Members: multi-select
  const handleSelectMember = (user) => {
    // Avoid duplicates
    if (!members.some((m) => m._id === user._id)) {
      setMembers([...members, user]);
    }
    setTypedMember("");
  };

  const removeMember = (userId) => {
    setMembers(members.filter((m) => m._id !== userId));
  };

  // --- Render ---
  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Manage User Groups</h2>

      {/* CREATE GROUP FORM */}
      <form onSubmit={createGroup} className="flex flex-col gap-4 mb-6">
        {/* Group Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Group Name:
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="e.g. Marketing Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        {/* Owner */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">Owner:</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="Type owner name or email..."
            value={typedOwner}
            onChange={(e) => setTypedOwner(e.target.value)}
          />
          {/* Dropdown suggestions */}
          {typedOwner && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md">
              {filterUsers(typedOwner).map((u) => (
                <div
                  key={u._id}
                  className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelectOwner(u)}
                >
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Second Owner */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">
            Second Owner (Optional):
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="Type second owner..."
            value={typedSecondOwner}
            onChange={(e) => setTypedSecondOwner(e.target.value)}
          />
          {typedSecondOwner && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md">
              {filterUsers(typedSecondOwner).map((u) => (
                <div
                  key={u._id}
                  className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelectSecondOwner(u)}
                >
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Third Owner */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">
            Third Owner (Optional):
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="Type third owner..."
            value={typedThirdOwner}
            onChange={(e) => setTypedThirdOwner(e.target.value)}
          />
          {typedThirdOwner && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md">
              {filterUsers(typedThirdOwner).map((u) => (
                <div
                  key={u._id}
                  className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelectThirdOwner(u)}
                >
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members (multi-select) */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">
            Members (Multi-select):
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="Type member name or email..."
            value={typedMember}
            onChange={(e) => setTypedMember(e.target.value)}
          />
          {typedMember && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md">
              {filterUsers(typedMember).map((u) => (
                <div
                  key={u._id}
                  className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelectMember(u)}
                >
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </div>
              ))}
            </div>
          )}
          {/* Display selected members as badges */}
          {members.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m._id}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {m.name ? `${m.name} (${m.email})` : m.email}
                  <button
                    type="button"
                    className="ml-1 text-red-600 hover:text-red-800 font-bold"
                    onClick={() => removeMember(m._id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit"
        >
          Create Group
        </button>
      </form>

      <hr className="my-6" />

      {/* DISPLAY EXISTING GROUPS */}
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
                {/* Show owners if populated */}
                {group.owner && typeof group.owner === "object" && (
                  <span className="ml-2 text-gray-600">
                    (Owner: {group.owner.name || group.owner.email})
                  </span>
                )}
                {group.secondOwner && typeof group.secondOwner === "object" && (
                  <span className="ml-2 text-gray-600">
                    / 2nd: {group.secondOwner.name || group.secondOwner.email}
                  </span>
                )}
                {group.thirdOwner && typeof group.thirdOwner === "object" && (
                  <span className="ml-2 text-gray-600">
                    / 3rd: {group.thirdOwner.name || group.thirdOwner.email}
                  </span>
                )}
                {/* For brevity, not listing members here.
                    You can do group.members.map(...) if you prefer */}
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
