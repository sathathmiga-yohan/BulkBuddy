
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Search,
  ShoppingBag,
  Users,
  X,
  XCircle,
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";

import {
  getSellerDeals,
  getSellerDealParticipants,
} from "../../../services/dealservice.js";

import { formatPrice } from "../../../data/mockDeals.js";

import "./Dealparticipants.css";

const statusLabels = {
  ALL: "All Participants",
  JOINED: "Joined",
  WAITING: "Waiting",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "Unable to load participants. Please try again.";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function exportCsv(participants, deal) {
  const headers = [
    "Participant ID",
    "Customer ID",
    "Customer Name",
    "Customer Email",
    "Deal",
    "Status",
    "Joined Date",
    "Delivery Name",
    "Delivery Phone",
    "Delivery Address",
    "Delivery City",
    "Delivery Postal Code",
  ];

  const rows = participants.map((participant) => [
    participant.id,
    participant.customer_id,
    participant.customer_name,
    participant.customer_email,
    deal.product_name,
    participant.status,
    participant.joined_at,
    participant.delivery_name,
    participant.delivery_phone,
    participant.delivery_address,
    participant.delivery_city,
    participant.delivery_postal_code,
  ]);

  const escapeCell = (value) =>
    `"${String(value ?? "")
      .replace(/^[\s]*([=+\-@])/, "'$1")
      .replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `bulkbuddy-participants-deal-${deal.id}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function Dealparticipants() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedDealId = searchParams.get("dealId");

  const [deals, setDeals] = useState([]);
  const [selectedDealId, setSelectedDealId] = useState("");

  const [participants, setParticipants] = useState([]);

  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingParticipants, setLoadingParticipants] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedParticipant, setSelectedParticipant] =
    useState(null);

  // LOAD SELLER'S REAL DEALS
  useEffect(() => {
    let active = true;

    const loadDeals = async () => {
      try {
        setLoadingDeals(true);
        setError("");

        const data = await getSellerDeals();

        if (!active) return;

        const sellerDeals = Array.isArray(data) ? data : [];

        setDeals(sellerDeals);

        const requested = sellerDeals.find(
          (deal) => String(deal.id) === requestedDealId
        );

        const initialDeal = requested || sellerDeals[0];

        setSelectedDealId(
          initialDeal ? String(initialDeal.id) : ""
        );
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoadingDeals(false);
        }
      }
    };

    loadDeals();

    return () => {
      active = false;
    };
  }, [requestedDealId]);

  const selectedDeal = deals.find(
    (deal) => String(deal.id) === String(selectedDealId)
  );

  // LOAD REAL PARTICIPANTS FOR SELECTED DEAL
  useEffect(() => {
    if (!selectedDealId) {
      setParticipants([]);
      return;
    }

    let active = true;

    const loadParticipants = async () => {
      try {
        setLoadingParticipants(true);
        setError("");
        setParticipants([]);

        const data = await getSellerDealParticipants(
          selectedDealId
        );

        if (!active) return;

        setParticipants(
          Array.isArray(data.participants)
            ? data.participants
            : []
        );
      } catch (err) {
        if (active) {
          setParticipants([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoadingParticipants(false);
        }
      }
    };

    loadParticipants();

    return () => {
      active = false;
    };
  }, [selectedDealId]);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return participants.filter((participant) => {
      const matchesSearch = [
        participant.customer_name,
        participant.customer_email,
        participant.id,
        participant.customer_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [participants, search, statusFilter]);

  const joinedCount = participants.filter(
    (participant) => participant.status === "JOINED"
  ).length;

  const waitingCount = participants.filter(
    (participant) => participant.status === "WAITING"
  ).length;

  const cancelledCount = participants.filter(
    (participant) => participant.status === "CANCELLED"
  ).length;

  const expiredCount = participants.filter(
    (participant) => participant.status === "EXPIRED"
  ).length;

  const progress = selectedDeal?.minimum_buyers
    ? Math.min(
        Math.round(
          (joinedCount / selectedDeal.minimum_buyers) * 100
        ),
        100
      )
    : 0;

  const changeDeal = (event) => {
    const nextId = event.target.value;

    setSelectedDealId(nextId);
    setSearch("");
    setStatusFilter("ALL");
    setSelectedParticipant(null);

    setSearchParams({ dealId: nextId });
  };

  return (
    <SellerLayout title="Deal Participants">
      {/* INTRO */}
      <section className="sdp-intro">
        <div>
          <small>GROUP BUYER MANAGEMENT</small>

          <h2>Deal Participants</h2>

          <p>
            View the customers who joined your group deals.
          </p>
        </div>

        <div className="sdp-intro-icon">
          <Users size={32} />
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="sdp-panel" role="alert">
          <AlertCircle size={19} />
          <p>{error}</p>
        </div>
      )}

      {/* DEAL SELECTOR */}
      <section className="sdp-panel sdp-deal-selector">
        <div>
          <label htmlFor="sdp-deal">
            Select a Deal
          </label>

          <p>
            Choose the product whose participants you want
            to view.
          </p>
        </div>

        <select
          id="sdp-deal"
          value={selectedDealId}
          onChange={changeDeal}
          disabled={loadingDeals || deals.length === 0}
        >
          {deals.length === 0 && (
            <option value="">
              {loadingDeals
                ? "Loading deals..."
                : "No deals available"}
            </option>
          )}

          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.product_name}
            </option>
          ))}
        </select>
      </section>

      {!loadingDeals && deals.length === 0 && (
        <section className="sdp-panel">
          <p>
            You have not created any deals yet.
            Create a deal first to view its participants.
          </p>
        </section>
      )}

      {selectedDeal && (
        <>
          {/* SELECTED DEAL SUMMARY */}
          <section className="sdp-deal-summary">
            <div className="sdp-summary-heading">
              <div className="sdp-product-icon">
                <ShoppingBag size={24} />
              </div>

              <div>
                <span>SELECTED GROUP DEAL</span>

                <h3>{selectedDeal.product_name}</h3>

                <p>
                  {selectedDeal.description ||
                    "Group buying deal"}
                </p>
              </div>
            </div>

            <div className="sdp-summary-details">
              <div>
                <small>Group Price</small>

                <strong>
                  {formatPrice(
                    Number(selectedDeal.group_price)
                  )}
                </strong>
              </div>

              <div>
                <small>Joined / Minimum Buyers</small>

                <strong>
                  {joinedCount}/
                  {selectedDeal.minimum_buyers}
                </strong>
              </div>

              <div>
                <small>Status</small>

                <span
                  className={`sdp-status ${String(
                    selectedDeal.status
                  ).toLowerCase()}`}
                >
                  {selectedDeal.status}
                </span>
              </div>
            </div>

            <div className="sdp-progress-heading">
              <span>Group Progress</span>

              <strong>{progress}%</strong>
            </div>

            <div className="sdp-progress">
              <span
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {/* STATISTICS */}
          <section className="sdp-stats">
            {[
              {
                title: "Total Records",
                value: participants.length,
                icon: Users,
                style: "purple",
              },
              {
                title: "Joined",
                value: joinedCount,
                icon: CheckCircle2,
                style: "green",
              },
              {
                title: "Waiting",
                value: waitingCount,
                icon: Clock3,
                style: "blue",
              },
              {
                title: "Cancelled / Expired",
                value: cancelledCount + expiredCount,
                icon: XCircle,
                style: "pink",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="sdp-stat"
                >
                  <div
                    className={`sdp-stat-icon ${item.style}`}
                  >
                    <Icon size={21} />
                  </div>

                  <span>{item.title}</span>

                  <strong>
                    {loadingParticipants ? "—" : item.value}
                  </strong>
                </article>
              );
            })}
          </section>

          {/* PARTICIPANTS TABLE */}
          <section className="sdp-panel">
            <div className="sdp-table-heading">
              <div>
                <h2>Participant List</h2>

                <p>
                  Showing {filteredParticipants.length} of{" "}
                  {participants.length} records
                </p>
              </div>

              <button
                type="button"
                className="sdp-export"
                disabled={
                  loadingParticipants ||
                  filteredParticipants.length === 0
                }
                onClick={() =>
                  exportCsv(
                    filteredParticipants,
                    selectedDeal
                  )
                }
              >
                <Download size={17} />
                Export CSV
              </button>
            </div>

            {/* SEARCH AND STATUS FILTER */}
            <div className="sdp-toolbar">
              <label className="sdp-search">
                <Search size={18} />

                <input
                  type="search"
                  placeholder="Search name, email or ID..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </label>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                {Object.entries(statusLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="sdp-table-wrapper">
              <table className="sdp-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Participant ID</th>
                    <th>Customer ID</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParticipants.map(
                    (participant) => (
                      <tr key={participant.id}>
                        <td>
                          <div className="sdp-person">
                            <div className="sdp-avatar">
                              {String(
                                participant.customer_name ||
                                  "?"
                              )
                                .split(" ")
                                .filter(Boolean)
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {participant.customer_name}
                              </strong>

                              <span>
                                {participant.customer_email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>{participant.id}</td>

                        <td>{participant.customer_id}</td>

                        <td>
                          {formatDate(
                            participant.joined_at
                          )}
                        </td>

                        <td>
                          <span
                            className={`sdp-status ${String(
                              participant.status
                            ).toLowerCase()}`}
                          >
                            {participant.status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="sdp-view"
                            onClick={() =>
                              setSelectedParticipant(
                                participant
                              )
                            }
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}

                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="sdp-empty"
                      >
                        <Users size={30} />

                        <strong>
                          {loadingParticipants
                            ? "Loading participants..."
                            : "No participants found"}
                        </strong>

                        <span>
                          {loadingParticipants
                            ? "Please wait."
                            : "Try another search or status filter."}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* PARTICIPANT DETAILS MODAL */}
      {selectedParticipant && selectedDeal && (
        <div
          className="sdp-modal-backdrop"
          onClick={() =>
            setSelectedParticipant(null)
          }
        >
          <section
            className="sdp-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Participant Details"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <h2>Participant Details</h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedParticipant(null)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </header>

            <div className="sdp-modal-body">
              <div className="sdp-modal-person">
                <div className="sdp-avatar">
                  {String(
                    selectedParticipant.customer_name ||
                      "?"
                  )
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {selectedParticipant.customer_name}
                  </h3>

                  <p>
                    {selectedParticipant.customer_email}
                  </p>
                </div>
              </div>

              {[
                [
                  "Participant ID",
                  selectedParticipant.id,
                ],
                [
                  "Customer ID",
                  selectedParticipant.customer_id,
                ],
                [
                  "Deal",
                  selectedDeal.product_name,
                ],
                [
                  "Group Price",
                  formatPrice(
                    Number(selectedDeal.group_price)
                  ),
                ],
                [
                  "Participation Status",
                  selectedParticipant.status,
                ],
                [
                  "Joined Date",
                  formatDate(
                    selectedParticipant.joined_at
                  ),
                ],
                [
                  "Last Updated",
                  formatDate(
                    selectedParticipant.updated_at
                  ),
                ],
                [
                  "Delivery Name",
                  selectedParticipant.delivery_name,
                ],
                [
                  "Delivery Phone",
                  selectedParticipant.delivery_phone,
                ],
                [
                  "Delivery Address",
                  selectedParticipant.delivery_address,
                ],
                [
                  "Delivery City",
                  selectedParticipant.delivery_city,
                ],
                [
                  "Postal Code",
                  selectedParticipant.delivery_postal_code,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="sdp-modal-row"
                >
                  <span>{label}</span>

                  <strong>{value ?? "—"}</strong>
                </div>
              ))}

              <button
                type="button"
                className="sdp-modal-close"
                onClick={() =>
                  setSelectedParticipant(null)
                }
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </SellerLayout>
  );
}
