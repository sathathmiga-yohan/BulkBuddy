import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getDealParticipants,
} from "../../../services/dealservice";

import "./DealParticipants.css";

function DealParticipants() {
  const { dealId } = useParams();

  const [participants, setParticipants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD PARTICIPANTS
  // ==========================================
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDealParticipants(dealId);

        setParticipants(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Participants error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load participants."
        );
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [dealId]);

  return (
    <main className="participants-page">
      <div className="container">

        {/* BACK */}
        <Link
          to="/seller/deals"
          className="participants-back"
        >
          ← Back to My Deals
        </Link>

        {/* HEADER */}
        <div className="participants-header">
          <span>Seller Center</span>

          <h1>Deal Participants</h1>

          <p>
            Customers participating in deal #
            {dealId}.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="participants-message">
            Loading participants...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="participants-error">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          participants.length === 0 && (
            <div className="participants-message">
              No participants have joined this
              deal yet.
            </div>
          )}

        {/* PARTICIPANTS TABLE */}
        {!loading &&
          !error &&
          participants.length > 0 && (
            <div className="participants-table-wrapper">

              <table className="participants-table">

                <thead>
                  <tr>
                    <th>Participation ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Joined At</th>
                  </tr>
                </thead>

                <tbody>

                  {participants.map(
                    (participant) => (
                      <tr key={participant.id}>

                        {/* PARTICIPATION ID */}
                        <td>
                          {participant.id}
                        </td>

                        {/* CUSTOMER */}
                        <td>
                          Customer #
                          {participant.customer_id}
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`participant-status ${String(
                              participant.status || ""
                            ).toLowerCase()}`}
                          >
                            {participant.status}
                          </span>
                        </td>

                        {/* JOINED DATE */}
                        <td>
                          {participant.joined_at
                            ? new Date(
                                participant.joined_at
                              ).toLocaleString()
                            : "-"}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

      </div>
    </main>
  );
}

export default DealParticipants;