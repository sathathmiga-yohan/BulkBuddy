
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";

import {
  getSellerDeals,
  getSellerDealParticipants,
  updateDeal,
  deleteDeal,
} from "../../../services/dealservice.js";

import { formatPrice } from "../../../data/mockDeals.js";

import "./SellerDeals.css";

const statusOptions = [
  "all",
  "active",
  "successful",
  "failed",
];

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || "Invalid value").join(", ");
  }

  return fallback;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function createEditForm(deal) {
  return {
    id: deal.id,
    product_name: deal.product_name,
    description: deal.description || "",
    normal_price: String(deal.normal_price),
    group_price: String(deal.group_price),
    minimum_buyers: String(deal.minimum_buyers),
    maximum_quantity: String(deal.maximum_quantity),
    deadline: toLocalDateTime(deal.deadline),
  };
}

export default function SellerDeals() {
  const [deals, setDeals] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");


  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");

      // Get seller's own deals
      const data = await getSellerDeals();

      const sellerDeals = Array.isArray(data) ? data : [];

      setDeals(sellerDeals);

      // Get actual participants for each deal
      const results = await Promise.allSettled(
        sellerDeals.map(async (deal) => {
          const response = await getSellerDealParticipants(deal.id);

          // Count only JOINED customers
          const joinedCount = (response.participants || []).filter(
            (participant) =>
              String(participant.status).toUpperCase() === "JOINED"
          ).length;

          return {
            dealId: deal.id,
            count: joinedCount,
          };
        })
      );

      const newCounts = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          newCounts[result.value.dealId] = result.value.count;
        }
      });

      setParticipantCounts(newCounts);

    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your deals.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch = (
        `${deal.product_name} ${deal.description || ""}`
      )
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        String(deal.status).toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deals, search, statusFilter]);

  const counts = {
    all: deals.length,
    active: deals.filter(
      (deal) => String(deal.status).toUpperCase() === "ACTIVE"
    ).length,
    successful: deals.filter(
      (deal) => String(deal.status).toUpperCase() === "SUCCESSFUL"
    ).length,
    failed: deals.filter(
      (deal) => String(deal.status).toUpperCase() === "FAILED"
    ).length,
  };

  const closeModal = () => {
    if (saving) return;

    setSelectedDeal(null);
    setEditingDeal(null);
    setDeletingDeal(null);
  };

  const updateEditField = (field, value) => {
    setEditingDeal((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveEditedDeal = async (event) => {
    event.preventDefault();

    if (!editingDeal || saving) return;

    const normalPrice = Number(editingDeal.normal_price);
    const groupPrice = Number(editingDeal.group_price);
    const minimumBuyers = Number(editingDeal.minimum_buyers);
    const maximumQuantity = Number(editingDeal.maximum_quantity);

    const deadline = new Date(editingDeal.deadline);

    if (
      editingDeal.product_name.trim().length < 2 ||
      !Number.isFinite(normalPrice) ||
      !Number.isFinite(groupPrice) ||
      normalPrice <= 0 ||
      groupPrice <= 0 ||
      groupPrice >= normalPrice ||
      !Number.isInteger(minimumBuyers) ||
      minimumBuyers < 1 ||
      !Number.isInteger(maximumQuantity) ||
      maximumQuantity < minimumBuyers ||
      Number.isNaN(deadline.getTime()) ||
      deadline.getTime() <= Date.now()
    ) {
      setNotice(
        "Please enter valid details. Group price must be lower than normal price, capacity must be valid, and deadline must be in the future."
      );
      return;
    }

    try {
      setSaving(true);
      setNotice("");

      const payload = {
        product_name: editingDeal.product_name.trim(),
        description: editingDeal.description.trim() || null,
        normal_price: normalPrice,
        group_price: groupPrice,
        minimum_buyers: minimumBuyers,
        maximum_quantity: maximumQuantity,
        deadline: deadline.toISOString(),
      };

      await updateDeal(editingDeal.id, payload);

      setEditingDeal(null);
      setNotice("Deal updated successfully.");
      await loadDeals();
    } catch (err) {
      setNotice(
        getErrorMessage(err, "Unable to update this deal.")
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingDeal || saving) return;

    try {
      setSaving(true);
      setNotice("");

      await deleteDeal(deletingDeal.id);

      setDeletingDeal(null);
      setNotice("Deal permanently deleted successfully.");

      await loadDeals();
    } catch (err) {
      setNotice(
        getErrorMessage(err, "Unable to delete this deal.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout title="My Deals">
      {/* PAGE INTRO */}
      <section className="sdeals-intro">
        <div>
          <small>DEAL MANAGEMENT</small>
          <h2>Manage Your Group Deals</h2>
          <p>View, filter and manage your product deals.</p>
        </div>

        <Link
          to="/seller/create-deal"
          className="sdeals-create-button"
        >
          <Plus size={18} />
          Create New Deal
        </Link>
      </section>

      {/* NOTIFICATION */}
      {(notice || error) && (
        <div className="sdeals-notice" role="status">
          <span>{error || notice}</span>

          <button
            type="button"
            onClick={() => {
              setNotice("");
              setError("");
            }}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATS */}
      <section className="sdeals-stats">
        {[
          { key: "all", label: "Total Deals", icon: Package },
          { key: "active", label: "Active Deals", icon: Clock3 },
          {
            key: "successful",
            label: "Successful",
            icon: CheckCircle2,
          },
          { key: "failed", label: "Failed Deals", icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.key} className="sdeals-stat">
              <div className={`sdeals-stat-icon ${item.key}`}>
                <Icon size={21} />
              </div>

              <span>{item.label}</span>
              <strong>{loading ? "..." : counts[item.key]}</strong>
            </article>
          );
        })}
      </section>

      {/* DEALS TABLE */}
      <section className="sdeals-panel">
        <div className="sdeals-panel-header">
          <div>
            <h2>All Product Deals</h2>
            <p>
              Showing {filteredDeals.length} of {deals.length} deals
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="sdeals-toolbar">
          <label className="sdeals-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search product..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="sdeals-filters">
            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  statusFilter === option ? "active" : ""
                }
                onClick={() => setStatusFilter(option)}
              >
                {option === "all"
                  ? "All Deals"
                  : option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="sdeals-table-wrapper">
          <table className="sdeals-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Group Price</th>
                <th>Participants</th>
                <th>Progress</th>
                <th>Status</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="sdeals-empty">
                    Loading your deals...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredDeals.map((deal) => {
                    const dealStatus = String(
                      deal.status || ""
                    ).toLowerCase();

                    return (
                      <tr key={deal.id}>
                        {/* PRODUCT */}
                        <td>
                          <div className="sdeals-product">
                            <div className="sdeals-product-icon">
                              <Package size={19} />
                            </div>

                            <div>
                              <strong>{deal.product_name}</strong>
                              <span>Deal #{deal.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="sdeals-price">
                          {formatPrice(Number(deal.group_price))}
                        </td>

                        {/* PARTICIPANTS */}
                        <td>
                          <span className="sdeals-buyers">
                            <Users size={15} />
                            {participantCounts[deal.id] ?? "—"} / {deal.minimum_buyers}                          </span>
                        </td>

                        {/* PROGRESS */}
                        {/* PROGRESS */}
                        <td>
                          {participantCounts[deal.id] === undefined ? (
                            <span className="sdeals-percent">—</span>
                          ) : (
                            <>
                              <span className="sdeals-percent">
                                {Math.min(
                                  Math.round(
                                    (participantCounts[deal.id] / deal.minimum_buyers) * 100
                                  ),
                                  100
                                )}%
                              </span>

                              <div className="sdeals-progress">
                                <span
                                  style={{
                                    width: `${Math.min(
                                      (participantCounts[deal.id] / deal.minimum_buyers) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`sdeals-status ${dealStatus}`}
                          >
                            {dealStatus}
                          </span>
                        </td>

                        {/* END DATE */}
                        <td>{formatDate(deal.deadline)}</td>

                        {/* ACTIONS */}
                        <td>
                          <div className="sdeals-actions">
                            <button
                              type="button"
                              className="view"
                              title="View Deal"
                              aria-label={`View ${deal.product_name}`}
                              onClick={() => setSelectedDeal(deal)}
                            >
                              <Eye size={17} />
                            </button>

                            {/* VIEW PARTICIPANTS */}
                            <Link
                              to={`/seller/participants?dealId=${deal.id}`}
                              className="participants"
                              title="View Participants"
                              aria-label={`View participants for ${deal.product_name}`}
                            >
                              <Users size={17} />
                            </Link>

                            <button
                              type="button"
                              className="edit"
                              title="Edit Deal"
                              aria-label={`Edit ${deal.product_name}`}
                              onClick={() => {
                                setNotice("");
                                setEditingDeal(createEditForm(deal));
                              }}
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="delete"
                              title="Delete Deal"
                              aria-label={`Delete ${deal.product_name}`}
                              onClick={() => {
                                setNotice("");
                                setDeletingDeal(deal);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDeals.length === 0 && (
                    <tr>
                      <td colSpan={7} className="sdeals-empty">
                        <Package size={34} />
                        <strong>No deals found</strong>
                        <span>Try another search or filter.</span>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <footer className="sdeals-table-footer">
          <span>
            Deals are loaded from the Backend database.
          </span>
        </footer>
      </section>

      {/* VIEW DEAL MODAL */}
      {selectedDeal && (
        <div
          className="sdeals-modal-backdrop"
          onClick={closeModal}
        >
          <section
            className="sdeals-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Deal Details"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>Deal Details</h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </header>

            <div className="sdeals-modal-content">
              <h3>{selectedDeal.product_name}</h3>

              <span
                className={`sdeals-status ${String(
                  selectedDeal.status
                ).toLowerCase()}`}
              >
                {selectedDeal.status}
              </span>

              <div className="sdeals-detail-list">
                <p>
                  <span>Description</span>
                  <strong>
                    {selectedDeal.description || "—"}
                  </strong>
                </p>

                <p>
                  <span>Normal Price</span>
                  <strong>
                    {formatPrice(Number(selectedDeal.normal_price))}
                  </strong>
                </p>

                <p>
                  <span>Group Price</span>
                  <strong>
                    {formatPrice(Number(selectedDeal.group_price))}
                  </strong>
                </p>

                <p>
                  <span>Minimum Buyers</span>
                  <strong>{selectedDeal.minimum_buyers}</strong>
                </p>

                <p>
                  <span>Maximum Capacity</span>
                  <strong>{selectedDeal.maximum_quantity}</strong>
                </p>

                <p>
                  <span>Deadline</span>
                  <strong>{formatDate(selectedDeal.deadline)}</strong>
                </p>
              </div>

              <button
                type="button"
                className="sdeals-modal-primary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* EDIT DEAL MODAL */}
      {editingDeal && (
        <div
          className="sdeals-modal-backdrop"
          onClick={closeModal}
        >
          <section
            className="sdeals-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit Deal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>Edit Deal</h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </header>

            <form
              className="sdeals-edit-form"
              onSubmit={saveEditedDeal}
            >
              <p>
                Changes will be saved to the Backend database.
                Existing participation and deadline rules are
                validated by the Backend.
              </p>

              <label>
                Product Name
                <input
                  required
                  type="text"
                  minLength={2}
                  maxLength={200}
                  value={editingDeal.product_name}
                  onChange={(event) =>
                    updateEditField(
                      "product_name",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  value={editingDeal.description}
                  onChange={(event) =>
                    updateEditField(
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Normal Price (LKR)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingDeal.normal_price}
                  onChange={(event) =>
                    updateEditField(
                      "normal_price",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Group Price (LKR)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingDeal.group_price}
                  onChange={(event) =>
                    updateEditField(
                      "group_price",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Minimum Buyers
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={editingDeal.minimum_buyers}
                  onChange={(event) =>
                    updateEditField(
                      "minimum_buyers",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Maximum Quantity
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={editingDeal.maximum_quantity}
                  onChange={(event) =>
                    updateEditField(
                      "maximum_quantity",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Deadline
                <input
                  required
                  type="datetime-local"
                  value={editingDeal.deadline}
                  onChange={(event) =>
                    updateEditField(
                      "deadline",
                      event.target.value
                    )
                  }
                />
              </label>

              <div className="sdeals-modal-buttons">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sdeals-modal-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingDeal && (
        <div
          className="sdeals-modal-backdrop"
          onClick={closeModal}
        >
          <section
            className="sdeals-modal sdeals-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete Deal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>Delete Deal?</h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </header>

            <div className="sdeals-modal-content">
              <div className="sdeals-delete-icon">
                <Trash2 size={25} />
              </div>

              <p>
                Permanently delete{" "}
                <strong>{deletingDeal.product_name}</strong>?
              </p>

              <small>
                This action requests deletion from the actual
                Backend database. It cannot be undone. The
                Backend may reject deletion if participation
                history exists.
              </small>

              <div className="sdeals-modal-buttons">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="sdeals-danger"
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Delete Deal"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </SellerLayout>
  );
}
