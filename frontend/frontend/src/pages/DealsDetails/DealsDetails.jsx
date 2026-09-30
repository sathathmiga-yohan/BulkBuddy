
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Users,
} from "lucide-react";

import { formatPrice } from "../../data/mockDeals.js";

import { getDealById } from "../../services/dealservice";

import {
  getMyDealParticipation,
  joinDeal,
  leaveDeal,
} from "../../services/participationservice";

import "./DealsDetails.css";

// Calculate remaining time using the actual backend deadline.
function getTimeRemaining(deadline) {
  const difference = Math.max(
    new Date(deadline).getTime() - Date.now(),
    0
  );

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function Countdown({ deadline }) {
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(deadline)
  );

  useEffect(() => {
    setRemaining(getTimeRemaining(deadline));

    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Mins", value: remaining.minutes },
    { label: "Secs", value: remaining.seconds },
  ];

  return (
    <div className="detail-countdown">
      {units.map((unit) => (
        <div className="detail-countdown-unit" key={unit.label}>
          <strong>
            {String(unit.value).padStart(2, "0")}
          </strong>
          <span>{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

const emptyDeliveryForm = {
  delivery_name: "",
  delivery_phone: "",
  delivery_address: "",
  delivery_city: "",
  delivery_postal_code: "",
};

function getApiError(error, fallback) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Invalid input")
      .join(", ");
  }

  return fallback;
}

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [participation, setParticipation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("description");

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState(emptyDeliveryForm);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Fetch one deal from FastAPI.
  useEffect(() => {
    let cancelled = false;

    const loadDeal = async () => {
      try {
        setLoading(true);
        setError("");
        setParticipation(null);

        const data = await getDealById(id);

        if (!cancelled) {
          setDeal(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiError(err, "Unable to load deal details.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDeal();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check whether the logged-in customer has joined this deal.
  useEffect(() => {
    let cancelled = false;

    const checkParticipation = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const data = await getMyDealParticipation(id);

        if (!cancelled) {
          setParticipation(data);
        }
      } catch (err) {
        // 404 means this customer has not participated.
        if (err?.response?.status === 404) {
          if (!cancelled) {
            setParticipation(null);
          }
        } else if (
          err?.response?.status !== 403 &&
          err?.response?.status !== 401
        ) {
          console.error(
            "Unable to check participation:",
            err
          );
        }
      }
    };

    checkParticipation();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Refresh deal information after Join / Leave
  const refreshDeal = async () => {
    try {
      const updatedDeal = await getDealById(id);
      setDeal(updatedDeal);
    } catch (error) {
      console.error("Unable to refresh deal:", error);
    }
  };

  const handleDeliveryChange = (event) => {
    const { name, value } = event.target;

    setDeliveryForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleJoinClick = () => {
    setActionError("");
    setActionMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setShowJoinForm(true);
  };

  const handleJoinSubmit = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setActionError("");
      setActionMessage("");

      const result = await joinDeal(id, {
        delivery_name: deliveryForm.delivery_name.trim(),
        delivery_phone: deliveryForm.delivery_phone.trim(),
        delivery_address: deliveryForm.delivery_address.trim(),
        delivery_city: deliveryForm.delivery_city.trim(),
        delivery_postal_code:
          deliveryForm.delivery_postal_code.trim() || null,
      });

      setParticipation(result);
      setShowJoinForm(false);

      await refreshDeal();

      setActionMessage(
        result.status === "WAITING"
          ? "You have been added to the waiting list."
          : "You have successfully joined this deal."
      );
    } catch (err) {
      setActionError(
        getApiError(err, "Unable to join this deal.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      setActionMessage("");

      const result = await leaveDeal(id);

      setParticipation(result);
      await refreshDeal();
      setActionMessage(
        "You have successfully left this deal."
      );
    } catch (err) {
      setActionError(
        getApiError(err, "Unable to leave this deal.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="detail-not-found">
        <h1>Loading deal...</h1>
        <p>Please wait while we fetch the deal details.</p>
      </main>
    );
  }

  if (error || !deal) {
    return (
      <main className="detail-not-found">
        <h1>Deal not found</h1>
        <p>
          {error || "This deal may no longer be available."}
        </p>

        <Link to="/deals">
          <ArrowLeft size={17} />
          Back to Deals
        </Link>
      </main>
    );
  }

  const normalPrice = Number(deal.normal_price);
  const groupPrice = Number(deal.group_price);

  const discount =
    normalPrice > 0
      ? Math.round(
        ((normalPrice - groupPrice) / normalPrice) * 100
      )
      : 0;

  const deadline = new Date(deal.deadline);
  const isExpired = deadline.getTime() <= Date.now();

  const status = String(deal.status).toUpperCase();

  const isActive = status === "ACTIVE" && !isExpired;

  const participationStatus = String(
    participation?.status || ""
  ).toUpperCase();

  const hasJoined =
    participationStatus === "JOINED" ||
    participationStatus === "WAITING";

  const isWaiting = participationStatus === "WAITING";

  return (
    <main className="detail-page">
      <div className="detail-container">
        {/* BREADCRUMB */}
        <nav
          className="detail-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/deals">Deals</Link>
          <span>/</span>
          <strong>{deal.product_name}</strong>
        </nav>

        {/* MAIN PRODUCT SECTION */}
        <section className="detail-product-layout">
          {/* LEFT: Product image is not currently supplied by API */}
          <div className="detail-gallery">
            <div className="detail-main-image">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  minHeight: "300px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <ShoppingBag size={50} />
              </div>

              <span className="detail-discount">
                {discount}% OFF
              </span>
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div className="detail-information">
            <div className="detail-category-row">
              <span className="detail-category">
                Group Deal
              </span>
            </div>

            <h1>{deal.product_name}</h1>

            <p className="detail-seller">
              Sold by{" "}
              <strong>Seller #{deal.seller_id}</strong>
            </p>

            <p className="detail-description">
              {deal.description || "No description provided."}
            </p>

            {/* PRICE */}
            <div className="detail-price-box">
              <span className="detail-price-label">
                EXCLUSIVE GROUP PRICE
              </span>

              <div className="detail-prices">
                <strong>{formatPrice(groupPrice)}</strong>
                <del>{formatPrice(normalPrice)}</del>
              </div>

              <span className="detail-saving">
                Save {formatPrice(normalPrice - groupPrice)}
              </span>
            </div>

            {/* GROUP BUYING INFORMATION */}
            <div className="detail-group-box">
              <div className="detail-group-title">
                <h2>
                  <Users size={19} />
                  Group Buying Information
                </h2>

                <span className="detail-live-badge">
                  {status}
                </span>
              </div>

              <div className="detail-progress-numbers">
                <div>
                  <strong>{deal.minimum_buyers}</strong>
                  <span>Minimum Buyers</span>
                </div>

                <div>
                  <strong>{deal.maximum_quantity}</strong>
                  <span>Maximum Capacity</span>
                </div>
              </div>

              <p className="detail-progress-message">
                The group deal succeeds when the minimum
                buyer target is reached by the deadline.
              </p>
            </div>

            {/* COUNTDOWN */}
            <div className="detail-deadline-box">
              <div className="detail-deadline-heading">
                <Clock3 size={18} />
                <strong>Deal Ends In</strong>
              </div>

              <Countdown deadline={deadline} />
            </div>

            {/* CUSTOMER PARTICIPATION STATUS */}
            {hasJoined && (
              <div
                className="detail-join-message"
                role="status"
              >
                <CheckCircle2 size={19} />

                <p>
                  {isWaiting
                    ? "You are on the waiting list."
                    : "You have joined this deal."}

                  {isWaiting &&
                    participation.waiting_position != null && (
                      <>
                        {" "}
                        Waiting position:{" "}
                        {participation.waiting_position}
                      </>
                    )}
                </p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="detail-actions">
              {hasJoined ? (
                <button
                  type="button"
                  className="detail-join-button"
                  onClick={handleLeave}
                  disabled={!isActive || actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : "Leave Group Deal"}
                </button>
              ) : (
                <button
                  type="button"
                  className="detail-join-button"
                  onClick={handleJoinClick}
                  disabled={!isActive || actionLoading}
                >
                  <ShoppingBag size={19} />

                  {isActive
                    ? "Join Group Deal"
                    : "Deal Closed"}

                  <ArrowRight size={17} />
                </button>
              )}

            </div>

            {/* DELIVERY FORM FOR JOIN / REJOIN */}
            {showJoinForm && (
              <form
                onSubmit={handleJoinSubmit}
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <h3>Delivery Details</h3>

                <p>
                  Please enter your delivery information
                  to join this group deal.
                </p>

                <label>
                  Full Name
                  <input
                    type="text"
                    name="delivery_name"
                    value={deliveryForm.delivery_name}
                    onChange={handleDeliveryChange}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="delivery_phone"
                    value={deliveryForm.delivery_phone}
                    onChange={handleDeliveryChange}
                    minLength={7}
                    maxLength={30}
                    required
                  />
                </label>

                <label>
                  Delivery Address
                  <textarea
                    name="delivery_address"
                    value={deliveryForm.delivery_address}
                    onChange={handleDeliveryChange}
                    minLength={5}
                    maxLength={500}
                    required
                  />
                </label>

                <label>
                  City
                  <input
                    type="text"
                    name="delivery_city"
                    value={deliveryForm.delivery_city}
                    onChange={handleDeliveryChange}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Postal Code (Optional)
                  <input
                    type="text"
                    name="delivery_postal_code"
                    value={deliveryForm.delivery_postal_code}
                    onChange={handleDeliveryChange}
                    maxLength={20}
                  />
                </label>

                <div className="detail-actions">
                  <button
                    type="submit"
                    className="detail-join-button"
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? "Processing..."
                      : "Confirm Join"}
                  </button>

                  <button
                    type="button"
                    className="detail-wishlist-button"
                    onClick={() => setShowJoinForm(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* API SUCCESS / ERROR MESSAGES */}
            {actionError && (
              <div role="alert" className="detail-join-message">
                <p>{actionError}</p>
              </div>
            )}

            {actionMessage && (
              <div role="status" className="detail-join-message">
                <CheckCircle2 size={19} />
                <p>{actionMessage}</p>
              </div>
            )}

            {/* TRUST INFORMATION */}
            <div className="detail-trust-row">
              <span>
                <ShieldCheck size={17} />
                Group Buying
              </span>

              <span>
                <Truck size={17} />
                Delivery Details Collected on Join
              </span>
            </div>
          </div>
        </section>

        {/* PRODUCT INFORMATION TABS */}
        <section className="detail-tabs-section">
          <div
            className="detail-tabs"
            role="tablist"
            aria-label="Product information"
          >
            {[
              ["description", "Description"],
              ["specifications", "Specifications"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={activeTab === value}
                className={
                  activeTab === value ? "active" : ""
                }
                onClick={() => setActiveTab(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="detail-tab-content">
            {activeTab === "description" && (
              <div>
                <h2>Product Description</h2>

                <p>
                  {deal.description ||
                    "No description provided."}
                </p>

                <p>
                  Join this group deal with other BulkBuddy
                  shoppers. When the minimum number of buyers
                  is reached before the deadline, the deal
                  can proceed at the group price.
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h2>Product Specifications</h2>

                <table className="detail-spec-table">
                  <tbody>
                    <tr>
                      <th>Product</th>
                      <td>{deal.product_name}</td>
                    </tr>

                    <tr>
                      <th>Seller</th>
                      <td>Seller #{deal.seller_id}</td>
                    </tr>

                    <tr>
                      <th>Minimum Buyers</th>
                      <td>{deal.minimum_buyers}</td>
                    </tr>

                    <tr>
                      <th>Maximum Quantity</th>
                      <td>{deal.maximum_quantity}</td>
                    </tr>

                    <tr>
                      <th>Status</th>
                      <td>{status}</td>
                    </tr>

                    <tr>
                      <th>Deadline</th>
                      <td>
                        {deadline.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <Link to="/deals" className="detail-back-link">
          <ArrowLeft size={17} />
          Back to All Deals
        </Link>
      </div>
    </main>
  );
}
