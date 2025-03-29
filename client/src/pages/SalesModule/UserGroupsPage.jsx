// src/pages/UserGroupsPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteButton from "./ConfirmDeleteButton.jsx"; // ADDED

/** Replace with your real API endpoint */
const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";

function UserGroupsPage() {
  // ----- Data States -----
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // ----- Form States -----
  const [groupName, setGroupName] = useState("");

  // Single Owner
  const [owner, setOwner] = useState(null);
  const [typedOwner, setTypedOwner] = useState("");

  // Second Owner
  const [secondOwner, setSecondOwner] = useState(null);
  const [typedSecondOwner, setTypedSecondOwner] = useState("");

  // Third Owner
  const [thirdOwner, setThirdOwner] = useState(null);
  const [typedThirdOwner, setTypedThirdOwner] = useState("");

  // Members (multi-select)
  const [members, setMembers] = useState([]);
  const [typedMember, setTypedMember] = useState("");

  const navigate = useNavigate();

  // ----- Effects -----
  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  // ----- API Calls -----
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/userGroups`);
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
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
      const body = {
        name: groupName,
        owner: owner?._id || null,
        secondOwner: secondOwner?._id || null,
        thirdOwner: thirdOwner?._id || null,
        members: members.map((m) => m._id),
      };

      await axios.post(`${API_BASE_URL}/userGroups`, body);
      // Reset form
      setGroupName("");
      setOwner(null);
      setTypedOwner("");
      setSecondOwner(null);
      setTypedSecondOwner("");
      setThirdOwner(null);
      setTypedThirdOwner("");
      setMembers([]);
      setTypedMember("");
      // Refresh list
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

  // CHANGED: We show a confirm delete here, then navigate back
  const handleDeleted = () => {
    // After successful delete, go back to listing
    navigate("/user-groups");
  };

  // ----- Typeahead / Filtering -----
  const filterUsers = (typed) => {
    if (!typed) return [];
    const lower = typed.toLowerCase();
    return allUsers.filter((u) => {
      const nm = u.name?.toLowerCase() || "";
      const em = u.email?.toLowerCase() || "";
      return nm.includes(lower) || em.includes(lower);
    });
  };

  // Single Selections
  const handleSelectOwner = (user) => {
    setOwner(user);
    setTypedOwner(user.name || user.email);
  };

  const handleSelectSecondOwner = (user) => {
    setSecondOwner(user);
    setTypedSecondOwner(user.name || user.email);
  };

  const handleSelectThirdOwner = (user) => {
    setThirdOwner(user);
    setTypedThirdOwner(user.name || user.email);
  };

  // Multi-select for members
  const handleSelectMember = (user) => {
    if (!members.some((m) => m._id === user._id)) {
      setMembers([...members, user]);
    }
    setTypedMember("");
  };

  const removeMember = (userId) => {
    setMembers(members.filter((m) => m._id !== userId));
  };

  // ----- Placeholder Actions for View / Edit -----
  const handleViewGroup = (groupId) => {
    // E.g. open a modal or navigate to /user-groups/:id
    //console.log("View group details:", groupId);
    navigate(`/user-groups/${groupId}`);
  };

  const handleEditGroup = (groupId) => {
    // E.g. open an edit modal or route to an edit page
    //console.log("Edit group:", groupId);
    navigate(`/user-groups/${groupId}`);
  };

  // ----- Render -----
  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Manage User Groups</h2>

      {/* CREATE GROUP FORM */}
      <form onSubmit={createGroup} className="flex flex-col gap-4 mb-6">
        {/* Group Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Group Name
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="e.g. DevOps Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        {/* SINGLE OWNERS */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Owner */}
          <div className="relative flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              Owner
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 w-full"
              placeholder="Type owner name/email..."
              value={typedOwner}
              onChange={(e) => {
                setTypedOwner(e.target.value);
                setOwner(null); // Clear if user modifies text
              }}
            />
            {/* Dropdown suggestions */}
            {typedOwner && !owner && (
              <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md max-h-40 overflow-y-auto">
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
            {/* Show selected user as a small chip if confirmed */}
            {owner && (
              <div className="mt-1 text-sm text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded">
                Selected: {owner.name || owner.email}
              </div>
            )}
          </div>

          {/* Second Owner */}
          <div className="relative flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              Second Owner (optional)
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 w-full"
              placeholder="Type second owner name/email..."
              value={typedSecondOwner}
              onChange={(e) => {
                setTypedSecondOwner(e.target.value);
                setSecondOwner(null);
              }}
            />
            {typedSecondOwner && !secondOwner && (
              <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md max-h-40 overflow-y-auto">
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
            {secondOwner && (
              <div className="mt-1 text-sm text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded">
                Selected: {secondOwner.name || secondOwner.email}
              </div>
            )}
          </div>

          {/* Third Owner */}
          <div className="relative flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              Third Owner (optional)
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 w-full"
              placeholder="Type third owner name/email..."
              value={typedThirdOwner}
              onChange={(e) => {
                setTypedThirdOwner(e.target.value);
                setThirdOwner(null);
              }}
            />
            {typedThirdOwner && !thirdOwner && (
              <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md max-h-40 overflow-y-auto">
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
            {thirdOwner && (
              <div className="mt-1 text-sm text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded">
                Selected: {thirdOwner.name || thirdOwner.email}
              </div>
            )}
          </div>
        </div>

        {/* MEMBERS (MULTI-SELECT) */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">
            Members
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            placeholder="Type member name/email..."
            value={typedMember}
            onChange={(e) => setTypedMember(e.target.value)}
          />
          {typedMember && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-md max-h-40 overflow-y-auto">
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
          {/* Display selected members as "chips" */}
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
                    className="ml-2 text-red-600 hover:text-red-800 font-bold"
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

      {/* LIST EXISTING GROUPS (TABLE-LIKE) */}
      <h3 className="text-lg font-semibold mb-2">
        Existing Groups : {groups.length}{" "}
      </h3>
      {groups.length === 0 ? (
        <p className="text-gray-500">No groups found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 font-medium text-gray-700">Group Name</th>
                <th className="p-2 font-medium text-gray-700">Owners</th>
                <th className="p-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group._id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="p-2">
                    <div className="font-semibold">{group.name}</div>
                  </td>
                  <td className="p-2 text-sm text-gray-700">
                    <div>
                      {group.owner &&
                        typeof group.owner === "object" &&
                        (group.owner.name || group.owner.email) && (
                          <span className="mr-2">
                            Owner: {group.owner.name || group.owner.email}
                          </span>
                        )}
                      {group.secondOwner &&
                        typeof group.secondOwner === "object" &&
                        (group.secondOwner.name || group.secondOwner.email) && (
                          <span className="mr-2">
                            2nd:{" "}
                            {group.secondOwner.name || group.secondOwner.email}
                          </span>
                        )}
                      {group.thirdOwner &&
                        typeof group.thirdOwner === "object" &&
                        (group.thirdOwner.name || group.thirdOwner.email) && (
                          <span>
                            3rd:{" "}
                            {group.thirdOwner.name || group.thirdOwner.email}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 space-x-2">
                      {/* VIEW Button */}
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => handleViewGroup(group._id)}
                      >
                        <span className="underline">View</span>
                      </button>

                      {/* EDIT Button */}
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditGroup(group._id)}
                      >
                        <span className="underline">Edit</span>
                      </button>

                      {/* DELETE Button */}
                      {/* <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteGroup(group._id)}
                      >
                        <span className="underline">Delete</span>
                      </button> */}
                      {/* DELETE with confirm */}
                      <ConfirmDeleteButton
                        itemId={group._id}
                        onDeleted={handleDeleted}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserGroupsPage;
