
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
import { sellerDeals } from "../sellerMockData.js";
import { formatPrice } from "../../../data/mockDeals.js";
import "./SellerDeals.css";

// Same storage key used by Createdeal.jsx
const STORAGE_KEY = "bulkbuddy_seller_created_deals_v1";
const SAMPLE_EDITS_KEY = "bulkbuddy_seller_sample_edits_v1";
const SAMPLE_DELETES_KEY = "bulkbuddy_seller_sample_deletes_v1";

const statusOptions = [
  "all",
  "active",
  "successful",
  "failed",
];

const categories = [
  "Electronics",
  "Accessories",
  "Fashion",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Other",
];

function loadSellerDeals() {
  try {
    const created = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const edits = JSON.parse(
      localStorage.getItem(SAMPLE_EDITS_KEY) || "{}"
    );

    const deleted = JSON.parse(
      localStorage.getItem(SAMPLE_DELETES_KEY) || "[]"
    );

    const createdDeals = Array.isArray(created)
      ? created
      : [];

    const deletedIds = Array.isArray(deleted)
      ? deleted
      : [];

    const sampleDeals = sellerDeals
      .filter(
        (deal) =>
          !deletedIds.includes(String(deal.id))
      )
      .map((deal) => ({
        ...deal,
        ...(edits[String(deal.id)] || {}),
      }));

    return [...createdDeals, ...sampleDeals];
  } catch (error) {
    console.error("Unable to load seller deals:", error);
    return sellerDeals;
  }
}

export default function SellerDeals() {
  const [deals, setDeals] = useState(loadSellerDeals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      setDeals(loadSellerDeals());
    };

    window.addEventListener(
      "bulkbuddy-deals-updated",
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "bulkbuddy-deals-updated",
        refresh
      );

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        `${deal.name} ${deal.category}`
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        deal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deals, search, statusFilter]);

  const counts = {
    all: deals.length,

    active: deals.filter(
      (deal) => deal.status === "active"
    ).length,

    successful: deals.filter(
      (deal) => deal.status === "successful"
    ).length,

    failed: deals.filter(
      (deal) => deal.status === "failed"
    ).length,
  };

  const closeModal = () => {
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

  // EDIT DEAL
  const saveEditedDeal = (event) => {
    event.preventDefault();

    if (!editingDeal) return;

    const groupPrice = Number(editingDeal.groupPrice);
    const required = Number(editingDeal.required);
    const participants = Number(
      editingDeal.participants || 0
    );

    if (
      !editingDeal.name.trim() ||
      !editingDeal.category.trim() ||
      !Number.isFinite(groupPrice) ||
      groupPrice <= 0 ||
      !Number.isInteger(required) ||
      required < 1 ||
      required < participants ||
      !editingDeal.endDate
    ) {
      setNotice(
        "Please enter valid details. Required buyers cannot be less than existing participants."
      );
      return;
    }

    try {
      const isCreatedDeal = String(
        editingDeal.id
      ).startsWith("seller-");

      if (isCreatedDeal) {
        const saved = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        const createdDeals = Array.isArray(saved)
          ? saved
          : [];

        const updatedDeals = createdDeals.map(
          (deal) => {
            if (
              String(deal.id) !==
              String(editingDeal.id)
            ) {
              return deal;
            }

            const deadline = new Date(
              `${editingDeal.endDate}T23:59:59`
            );

            const discount =
              deal.originalPrice > 0
                ? Math.round(
                    (1 -
                      groupPrice /
                        deal.originalPrice) *
                      100
                  )
                : 0;

            return {
              ...deal,
              ...editingDeal,

              groupPrice,
              required,

              // Preserve existing participation data.
              joined: deal.joined,
              participants: deal.participants,

              discount,

              daysLeft: Math.max(
                0,
                Math.ceil(
                  (deadline - new Date()) /
                    86400000
                )
              ),
            };
          }
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedDeals)
        );
      } else {
        // Keep sample seller edits in separate storage.
        const savedEdits = JSON.parse(
          localStorage.getItem(SAMPLE_EDITS_KEY) ||
            "{}"
        );

        savedEdits[String(editingDeal.id)] = {
          ...editingDeal,
          groupPrice,
          required,
        };

        localStorage.setItem(
          SAMPLE_EDITS_KEY,
          JSON.stringify(savedEdits)
        );
      }

      setDeals(loadSellerDeals());

      window.dispatchEvent(
        new Event("bulkbuddy-deals-updated")
      );

      setNotice(
        "Deal updated successfully in this browser."
      );

      closeModal();
    } catch (error) {
      console.error("Unable to edit deal:", error);
      setNotice("Unable to save changes.");
    }
  };

  // DELETE DEAL
  const confirmDelete = () => {
    if (!deletingDeal) return;

    try {
      const isCreatedDeal = String(
        deletingDeal.id
      ).startsWith("seller-");

      if (isCreatedDeal) {
        const saved = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        const createdDeals = Array.isArray(saved)
          ? saved
          : [];

        const remainingDeals = createdDeals.filter(
          (deal) =>
            String(deal.id) !==
            String(deletingDeal.id)
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(remainingDeals)
        );
      } else {
        const saved = JSON.parse(
          localStorage.getItem(
            SAMPLE_DELETES_KEY
          ) || "[]"
        );

        const deletedIds = Array.isArray(saved)
          ? saved
          : [];

        const updatedIds = [
          ...new Set([
            ...deletedIds,
            String(deletingDeal.id),
          ]),
        ];

        localStorage.setItem(
          SAMPLE_DELETES_KEY,
          JSON.stringify(updatedIds)
        );
      }

      setDeals(loadSellerDeals());

      window.dispatchEvent(
        new Event("bulkbuddy-deals-updated")
      );

      setNotice(
        "Deal deleted successfully in this browser."
      );

      closeModal();
    } catch (error) {
      console.error("Unable to delete deal:", error);
      setNotice("Unable to delete deal.");
    }
  };

  return (
    <SellerLayout title="My Deals">
      {/* PAGE INTRO */}
      <section className="sdeals-intro">
        <div>
          <small>DEAL MANAGEMENT</small>

          <h2>Manage Your Group Deals</h2>

          <p>
            View, filter and manage your product deals.
          </p>
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
      {notice && (
        <div
          className="sdeals-notice"
          role="status"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATS */}
      <section className="sdeals-stats">
        {[
          {
            key: "all",
            label: "Total Deals",
            icon: Package,
          },
          {
            key: "active",
            label: "Active Deals",
            icon: Clock3,
          },
          {
            key: "successful",
            label: "Successful",
            icon: CheckCircle2,
          },
          {
            key: "failed",
            label: "Failed Deals",
            icon: XCircle,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.key}
              className="sdeals-stat"
            >
              <div
                className={`sdeals-stat-icon ${item.key}`}
              >
                <Icon size={21} />
              </div>

              <span>{item.label}</span>

              <strong>
                {counts[item.key]}
              </strong>
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
              Showing {filteredDeals.length} of{" "}
              {deals.length} deals
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="sdeals-toolbar">
          <label className="sdeals-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search product or category..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

          <div className="sdeals-filters">
            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  statusFilter === option
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(option)
                }
              >
                {option === "all"
                  ? "All Deals"
                  : option[0].toUpperCase() +
                    option.slice(1)}
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
              {filteredDeals.map((deal) => {
                const participants = Number(
                  deal.participants || 0
                );

                const required = Number(
                  deal.required || 1
                );

                const progress = Math.min(
                  Math.round(
                    (participants / required) *
                      100
                  ),
                  100
                );

                return (
                  <tr key={deal.id}>
                    {/* PRODUCT */}
                    <td>
                      <div className="sdeals-product">
                        <div className="sdeals-product-icon">
                          <Package size={19} />
                        </div>

                        <div>
                          <strong>
                            {deal.name}
                          </strong>

                          <span>
                            {deal.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PRICE */}
                    <td className="sdeals-price">
                      {formatPrice(
                        deal.groupPrice
                      )}
                    </td>

                    {/* PARTICIPANTS */}
                    <td>
                      <span className="sdeals-buyers">
                        <Users size={15} />

                        {participants}/{required}
                      </span>
                    </td>

                    {/* PROGRESS */}
                    <td>
                      <span className="sdeals-percent">
                        {progress}%
                      </span>

                      <div className="sdeals-progress">
                        <span
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`sdeals-status ${deal.status}`}
                      >
                        {deal.status}
                      </span>
                    </td>

                    {/* END DATE */}
                    <td>{deal.endDate}</td>

                    {/* ACTIONS */}
                    <td>
                      <div className="sdeals-actions">
                        <button
                          type="button"
                          className="view"
                          title="View Deal"
                          aria-label={`View ${deal.name}`}
                          onClick={() =>
                            setSelectedDeal(deal)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="edit"
                          title="Edit Deal"
                          aria-label={`Edit ${deal.name}`}
                          onClick={() => {
                            setNotice("");
                            setEditingDeal({
                              ...deal,
                            });
                          }}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          title="Delete Deal"
                          aria-label={`Delete ${deal.name}`}
                          onClick={() =>
                            setDeletingDeal(deal)
                          }
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
                  <td
                    colSpan={7}
                    className="sdeals-empty"
                  >
                    <Package size={34} />

                    <strong>
                      No deals found
                    </strong>

                    <span>
                      Try another search or filter.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="sdeals-table-footer">
          <span>
            Demo data is saved in this browser.
            The backend database is not connected yet.
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
            onClick={(event) =>
              event.stopPropagation()
            }
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
              <h3>{selectedDeal.name}</h3>

              <span
                className={`sdeals-status ${selectedDeal.status}`}
              >
                {selectedDeal.status}
              </span>

              <div className="sdeals-detail-list">
                <p>
                  <span>Category</span>
                  <strong>
                    {selectedDeal.category}
                  </strong>
                </p>

                <p>
                  <span>Group Price</span>
                  <strong>
                    {formatPrice(
                      selectedDeal.groupPrice
                    )}
                  </strong>
                </p>

                <p>
                  <span>Participants</span>
                  <strong>
                    {selectedDeal.participants || 0}
                  </strong>
                </p>

                <p>
                  <span>Required Buyers</span>
                  <strong>
                    {selectedDeal.required}
                  </strong>
                </p>

                <p>
                  <span>End Date</span>
                  <strong>
                    {selectedDeal.endDate}
                  </strong>
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <h2>Edit Deal</h2>

              <button
                type="button"
                onClick={closeModal}
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
                Changes to your newly created deals
                will also appear on the customer
                deals page in this browser.
              </p>

              {/* PRODUCT NAME */}
              <label>
                Product Name

                <input
                  required
                  type="text"
                  value={editingDeal.name}
                  onChange={(event) =>
                    updateEditField(
                      "name",
                      event.target.value
                    )
                  }
                />
              </label>

              {/* CATEGORY */}
              <label>
                Category

                <select
                  value={editingDeal.category}
                  onChange={(event) =>
                    updateEditField(
                      "category",
                      event.target.value
                    )
                  }
                >
                  {[
                    ...new Set([
                      editingDeal.category,
                      ...categories,
                    ]),
                  ].map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              {/* GROUP PRICE */}
              <label>
                Group Price (LKR)

                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    editingDeal.groupPrice
                  }
                  onChange={(event) =>
                    updateEditField(
                      "groupPrice",
                      event.target.value
                    )
                  }
                />
              </label>

              {/* REQUIRED BUYERS */}
              <label>
                Required Buyers

                <input
                  required
                  type="number"
                  min={Math.max(
                    1,
                    Number(
                      editingDeal.participants || 0
                    )
                  )}
                  step="1"
                  value={editingDeal.required}
                  onChange={(event) =>
                    updateEditField(
                      "required",
                      event.target.value
                    )
                  }
                />
              </label>

              {/* END DATE */}
              <label>
                End Date

                <input
                  required
                  type="date"
                  value={editingDeal.endDate}
                  onChange={(event) =>
                    updateEditField(
                      "endDate",
                      event.target.value
                    )
                  }
                />
              </label>

              <div className="sdeals-modal-buttons">
                <button
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sdeals-modal-primary"
                >
                  Save Changes
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <h2>Delete Deal?</h2>

              <button
                type="button"
                onClick={closeModal}
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
                Remove{" "}
                <strong>
                  {deletingDeal.name}
                </strong>{" "}
                from this demo list?
              </p>

              <small>
                This will remove the deal from
                browser demo data, not from the
                backend database.
              </small>

              <div className="sdeals-modal-buttons">
                <button
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="sdeals-danger"
                  onClick={confirmDelete}
                >
                  Delete Deal
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </SellerLayout>
  );
}
