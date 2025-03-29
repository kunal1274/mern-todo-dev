// src/pages/ViewUserGroup.jsx
// ADDED: Detailed "View" page with a Back button, Edit button, and ConfirmDelete.

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import ConfirmDeleteButton from "./ConfirmDeleteButton.jsx"; // ADDED

const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";

function ViewUserGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroupDetail();
  }, []);

  const fetchGroupDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/userGroups/${groupId}`);
      setGroup(res.data);
    } catch (error) {
      console.error("Error fetching group detail:", error);
    }
  };

  // CHANGED: We show a confirm delete here, then navigate back
  const handleDeleted = () => {
    // After successful delete, go back to listing
    navigate("/user-groups");
  };

  return (
    <div className="container mx-auto max-w-xl bg-white shadow p-6 mt-4 rounded">
      <h2 className="text-2xl font-bold mb-4">User Group Detail</h2>

      {!group ? (
        <p>Loading group details...</p>
      ) : (
        <>
          <div className="mb-4">
            <strong>Name:</strong> {group.name}
          </div>

          <div className="mb-2">
            <strong>Owner:</strong>{" "}
            {group.owner && typeof group.owner === "object"
              ? group.owner.name || group.owner.email
              : "None"}
          </div>
          <div className="mb-2">
            <strong>Second Owner:</strong>{" "}
            {group.secondOwner && typeof group.secondOwner === "object"
              ? group.secondOwner.name || group.secondOwner.email
              : "None"}
          </div>
          <div className="mb-4">
            <strong>Third Owner:</strong>{" "}
            {group.thirdOwner && typeof group.thirdOwner === "object"
              ? group.thirdOwner.name || group.thirdOwner.email
              : "None"}
          </div>

          <div className="mb-4">
            <strong>Members:</strong>{" "}
            {group.members && group.members.length > 0 ? (
              <ul className="list-disc ml-6 mt-2">
                {group.members.map((m) => (
                  <li key={m._id}>
                    {m.name ? `${m.name} (${m.email})` : m.email}
                  </li>
                ))}
              </ul>
            ) : (
              "No members."
            )}
          </div>

          <div className="flex gap-4 mt-6">
            {/* BACK button */}
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => navigate("/user-groups")} // go back to the listing
            >
              Back
            </button>

            {/* EDIT button */}
            <Link
              to={`/user-groups/${groupId}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Edit
            </Link>

            {/* DELETE with confirm */}
            <ConfirmDeleteButton itemId={groupId} onDeleted={handleDeleted} />
          </div>
        </>
      )}
    </div>
  );
}

export default ViewUserGroup;
