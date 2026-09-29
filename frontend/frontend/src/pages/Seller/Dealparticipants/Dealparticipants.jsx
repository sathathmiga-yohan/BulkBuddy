
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Search,
  ShoppingBag,
  Users,
  X,
  XCircle
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";
import { sellerDeals } from "../sellerMockData.js";
import { formatPrice } from "../../../data/mockDeals.js";

import "./Dealparticipants.css";

const sampleNames = [
  "Nimal Perera",
  "Kavindi Silva",
  "Arun Kumar",
  "Fathima Rizna",
  "Dinesh Fernando",
  "Tharushi Jayasinghe",
  "Mohamed Irfan",
  "Shalini Raj",
  "Kasun Bandara",
  "Anusha Devi",
  "Praveen Kumar",
  "Dilani Fernando",
  "Ramesh Siva",
  "Ishara Perera",
  "Sanjay Raj",
  "Nethmi Silva",
  "Rizwan Ahmed",
  "Priya Kumar",
  "Chamod Fernando",
  "Ayesha Fathima",
  "Kishan Perera",
  "Madhavi Raj",
  "Sahan Silva",
  "Fathima Nisha",
  "Dulani Jayasinghe",
  "Vijay Kumar",
  "Thilini Perera",
  "Mohamed Safwan",
  "Janani Devi",
  "Roshan Fernando"
];

function createDemoParticipants(deals) {
  return deals.flatMap((deal) => {
    const total = Number(deal.participants) || 0;

    return Array.from(
      { length: total },
      (_, index) => {
        const name =
          sampleNames[index % sampleNames.length];

        const participantId =
          `P${deal.id}-${String(index + 1).padStart(3, "0")}`;

        const joinedDay =
          String((index % 25) + 1).padStart(2, "0");

        return {
          id: participantId,
          dealId: deal.id,
          name,
          email:
            `demo${deal.id}_${index + 1}@example.com`,
          quantity: 1,
          joinedDate: `2026-09-${joinedDay}`,
          status:
            deal.status === "successful"
              ? "confirmed"
              : deal.status === "failed"
              ? "cancelled"
              : index % 7 === 0
              ? "pending"
              : "joined"
        };
      }
    );
  });
}

const demoParticipants =
  createDemoParticipants(sellerDeals);

function exportCsv(participants, deal) {
  const headers = [
    "Participant ID",
    "Customer Name",
    "Email",
    "Deal",
    "Quantity",
    "Joined Date",
    "Status"
  ];

  const rows = participants.map((participant) => [
    participant.id,
    participant.name,
    participant.email,
    deal.name,
    participant.quantity,
    participant.joinedDate,
    participant.status
  ]);

  const escapeCell = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

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
  link.download =
    `bulkbuddy-participants-deal-${deal.id}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const statusLabels = {
  all: "All Participants",
  joined: "Joined",
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled"
};

export default function Dealparticipants() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const requestedDealId = Number(
    searchParams.get("dealId")
  );

  const initialDeal =
    sellerDeals.find(
      (deal) => deal.id === requestedDealId
    ) || sellerDeals[0];

  const [selectedDealId, setSelectedDealId] =
    useState(initialDeal?.id ?? "");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedParticipant, setSelectedParticipant] =
    useState(null);

  const selectedDeal = sellerDeals.find(
    (deal) => deal.id === Number(selectedDealId)
  );

  const dealParticipants = useMemo(
    () =>
      demoParticipants.filter(
        (participant) =>
          participant.dealId ===
          Number(selectedDealId)
      ),
    [selectedDealId]
  );

  const filteredParticipants = useMemo(() => {
    return dealParticipants.filter((participant) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        participant.name
          .toLowerCase()
          .includes(query) ||
        participant.email
          .toLowerCase()
          .includes(query) ||
        participant.id
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        participant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dealParticipants, search, statusFilter]);

  const totalQuantity = dealParticipants.reduce(
    (sum, participant) =>
      sum + participant.quantity,
    0
  );

  const confirmedCount = dealParticipants.filter(
    (participant) =>
      participant.status === "confirmed"
  ).length;

  const pendingCount = dealParticipants.filter(
    (participant) =>
      participant.status === "pending"
  ).length;

  const progress = selectedDeal
    ? Math.min(
        Math.round(
          (selectedDeal.participants /
            selectedDeal.required) *
            100
        ),
        100
      )
    : 0;

  const changeDeal = (event) => {
    const nextId = Number(event.target.value);

    setSelectedDealId(nextId);
    setSearch("");
    setStatusFilter("all");
    setSelectedParticipant(null);

    setSearchParams({
      dealId: String(nextId)
    });
  };

  return (
    <SellerLayout title="Deal Participants">
      <section className="sdp-intro">
        <div>
          <small>GROUP BUYER MANAGEMENT</small>

          <h2>Deal Participants</h2>

          <p>
            View the customers who joined
            your group deals.
          </p>
        </div>

        <div className="sdp-intro-icon">
          <Users size={32} />
        </div>
      </section>

      <section className="sdp-panel sdp-deal-selector">
        <div>
          <label htmlFor="sdp-deal">
            Select a Deal
          </label>

          <p>
            Choose the product whose participants
            you want to view.
          </p>
        </div>

        <select
          id="sdp-deal"
          value={selectedDealId}
          onChange={changeDeal}
        >
          {sellerDeals.map((deal) => (
            <option
              key={deal.id}
              value={deal.id}
            >
              {deal.name}
            </option>
          ))}
        </select>
      </section>

      {selectedDeal && (
        <>
          <section className="sdp-deal-summary">
            <div className="sdp-summary-heading">
              <div className="sdp-product-icon">
                <ShoppingBag size={24} />
              </div>

              <div>
                <span>SELECTED GROUP DEAL</span>
                <h3>{selectedDeal.name}</h3>
                <p>{selectedDeal.category}</p>
              </div>
            </div>

            <div className="sdp-summary-details">
              <div>
                <small>Group Price</small>

                <strong>
                  {formatPrice(
                    selectedDeal.groupPrice
                  )}
                </strong>
              </div>

              <div>
                <small>Participants</small>

                <strong>
                  {selectedDeal.participants}/
                  {selectedDeal.required}
                </strong>
              </div>

              <div>
                <small>Status</small>

                <span
                  className={`sdp-status ${selectedDeal.status}`}
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
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
          </section>

          <section className="sdp-stats">
            {[
              {
                title: "Total Participants",
                value: dealParticipants.length,
                icon: Users,
                style: "purple"
              },
              {
                title: "Total Quantity",
                value: totalQuantity,
                icon: ShoppingBag,
                style: "blue"
              },
              {
                title: "Confirmed",
                value: confirmedCount,
                icon: CheckCircle2,
                style: "green"
              },
              {
                title: "Pending",
                value: pendingCount,
                icon: Clock3,
                style: "pink"
              }
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
                  <strong>{item.value}</strong>
                </article>
              );
            })}
          </section>

          <section className="sdp-panel">
            <div className="sdp-table-heading">
              <div>
                <h2>Participant List</h2>

                <p>
                  Showing{" "}
                  {filteredParticipants.length} of{" "}
                  {dealParticipants.length} participants
                </p>
              </div>

              <button
                type="button"
                className="sdp-export"
                disabled={
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
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                {Object.entries(
                  statusLabels
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sdp-table-wrapper">
              <table className="sdp-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Participant ID</th>
                    <th>Quantity</th>
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
                              {participant.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </div>

                            <div>
                              <strong>
                                {participant.name}
                              </strong>

                              <span>
                                {participant.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {participant.id}
                        </td>

                        <td>
                          {participant.quantity}
                        </td>

                        <td>
                          {participant.joinedDate}
                        </td>

                        <td>
                          <span
                            className={`sdp-status ${participant.status}`}
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

                  {filteredParticipants.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="sdp-empty"
                      >
                        <Users size={30} />
                        <strong>
                          No participants found
                        </strong>
                        <span>
                          Try another search
                          or status filter.
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

      <p className="sdp-demo-note">
        This page uses generated sample customer
        records. Participant counts come from the
        existing seller demo deals. No real customer
        data or payment records are displayed.
      </p>

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
                  {selectedParticipant.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div>
                  <h3>
                    {selectedParticipant.name}
                  </h3>

                  <p>
                    {selectedParticipant.email}
                  </p>
                </div>
              </div>

              {[
                [
                  "Participant ID",
                  selectedParticipant.id
                ],
                [
                  "Deal",
                  selectedDeal.name
                ],
                [
                  "Group Price",
                  formatPrice(
                    selectedDeal.groupPrice
                  )
                ],
                [
                  "Quantity",
                  selectedParticipant.quantity
                ],
                [
                  "Estimated Order Value",
                  formatPrice(
                    selectedDeal.groupPrice *
                      selectedParticipant.quantity
                  )
                ],
                [
                  "Joined Date",
                  selectedParticipant.joinedDate
                ],
                [
                  "Participation Status",
                  selectedParticipant.status
                ]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="sdp-modal-row"
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
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
