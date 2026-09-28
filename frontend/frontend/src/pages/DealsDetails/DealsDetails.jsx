import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getDealById,
} from "../../services/dealservice";

import {
  joinDeal,
  leaveDeal,
  getMyDeals,
} from "../../services/participationservice";

import "./DealsDetails.css";

function DealDetails() {
  const { dealId } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD ONE DEAL
  // ==========================================
  const loadDeal = async () => {
    try {
      const data = await getDealById(dealId);

      setDeal(data);
    } catch (error) {
      console.error(
        "Load deal error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load deal."
      );
    }
  };

  // ==========================================
  // CHECK CUSTOMER ALREADY JOINED
  // ==========================================
  const checkJoinedStatus = async () => {
    if (
      !token ||
      user?.role !== "CUSTOMER"
    ) {
      setIsJoined(false);
      return;
    }

    try {
      const myDeals = await getMyDeals();

      const joined =
        Array.isArray(myDeals) &&
        myDeals.some(
          (item) =>
            Number(item.id) ===
            Number(dealId)
        );

      setIsJoined(joined);
    } catch (error) {
      console.error(
        "Check joined status error:",
        error
      );

      setIsJoined(false);
    }
  };

  // ==========================================
  // LOAD PAGE
  // ==========================================
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        await loadDeal();
        await checkJoinedStatus();
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [dealId]);

  // ==========================================
  // JOIN DEAL
  // ==========================================
  const handleJoin = async () => {
    if (!token || !user) {
      alert(
        "Please login as a customer to join."
      );

      navigate("/login");
      return;
    }

    if (user.role !== "CUSTOMER") {
      alert(
        "Only customers can join deals."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await joinDeal(dealId);

      setIsJoined(true);

      // Get updated current_participants
      await loadDeal();

      alert(
        "Successfully joined the deal!"
      );
    } catch (error) {
      console.error(
        "Join error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to join deal."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LEAVE DEAL
  // ==========================================
  const handleLeave = async () => {
    try {
      setActionLoading(true);
      setError("");

      await leaveDeal(dealId);

      setIsJoined(false);

      // Get updated current_participants
      await loadDeal();

      alert("You left the deal.");
    } catch (error) {
      console.error(
        "Leave error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to leave deal."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="deal-details-page">
        <div className="container">
          <p>Loading deal...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // DEAL NOT FOUND
  // ==========================================
  if (!deal) {
    return (
      <main className="deal-details-page">
        <div className="container">
          <p>
            {error || "Deal not found."}
          </p>

          <Link to="/deals">
            ← Back to Deals
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // EXACT BACKEND DEAL RESPONSE
  // ==========================================
  const productName =
    deal.product_name || "Deal";

  const description =
    deal.description ||
    "No description available.";

  const normalPrice = Number(
    deal.normal_price ?? 0
  );

  const groupPrice = Number(
    deal.group_price ?? 0
  );

  const minimumBuyers = Number(
    deal.minimum_buyers ?? 0
  );

  // Exact backend field
  const currentBuyers = Number(
    deal.current_participants ?? 0
  );

  // Exact backend field
  const remainingBuyers = Number(
    deal.remaining_target ?? 0
  );

  // Exact backend field
  const availableCapacity = Number(
    deal.available_capacity ?? 0
  );

  // ==========================================
  // PROGRESS
  // ==========================================
  const progress =
    minimumBuyers > 0
      ? Math.min(
          (currentBuyers /
            minimumBuyers) *
            100,
          100
        )
      : 0;

  // ==========================================
  // SAVINGS
  // ==========================================
  const savings = Math.max(
    normalPrice - groupPrice,
    0
  );

  const savingsPercentage =
    normalPrice > 0
      ? Math.round(
          (savings / normalPrice) * 100
        )
      : 0;

  // ==========================================
  // DEADLINE
  // ==========================================
  const deadline = deal.deadline
    ? new Date(
        deal.deadline
      ).toLocaleString()
    : "Not available";

  return (
    <main className="deal-details-page">
      <div className="container">

        {/* BACK */}
        <Link
          to="/deals"
          className="back-deals"
        >
          ← Back to Deals
        </Link>

        {/* ERROR */}
        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <div className="deal-details-grid">

          {/* VISUAL */}
          <div className="deal-visual">

            <span className="details-status">
              {deal.status}
            </span>

            <div className="details-product-icon">
              🛍️
            </div>

          </div>

          {/* INFORMATION */}
          <div className="deal-information">

            <span className="details-label">
              Group Deal
            </span>

            <h1>{productName}</h1>

            <p className="details-description">
              {description}
            </p>

            {/* PRICES */}
            <div className="details-price-section">

              <div>
                <span className="price-title">
                  Normal Price
                </span>

                <span className="details-normal-price">
                  Rs.{" "}
                  {normalPrice.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="price-title">
                  Group Price
                </span>

                <span className="details-group-price">
                  Rs.{" "}
                  {groupPrice.toLocaleString()}
                </span>
              </div>

            </div>

            {/* SAVINGS */}
            <div className="saving-box">
              You save{" "}

              <strong>
                Rs.{" "}
                {savings.toLocaleString()}
              </strong>{" "}

              ({savingsPercentage}%)
            </div>

            {/* PROGRESS */}
            <div className="group-progress-section">

              <div className="progress-heading">

                <span>
                  {currentBuyers} buyers joined
                </span>

                <span>
                  Target: {minimumBuyers}
                </span>

              </div>

              <div className="details-progress">

                <div
                  className="details-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <p className="remaining-text">
                {remainingBuyers > 0
                  ? `${remainingBuyers} more buyer${
                      remainingBuyers > 1
                        ? "s"
                        : ""
                    } needed to reach the target.`
                  : "Group target reached!"}
              </p>

            </div>

            {/* STATS */}
            <div className="deal-stat-grid">

              <div className="deal-stat">
                <span>👥</span>

                <div>
                  <small>Joined</small>

                  <strong>
                    {currentBuyers}
                  </strong>
                </div>
              </div>

              <div className="deal-stat">
                <span>📦</span>

                <div>
                  <small>Available</small>

                  <strong>
                    {availableCapacity}
                  </strong>
                </div>
              </div>

              <div className="deal-stat">
                <span>⏱️</span>

                <div>
                  <small>Deadline</small>

                  <strong>
                    {deadline}
                  </strong>
                </div>
              </div>

            </div>

            {/* JOIN / LEAVE */}
            {user?.role === "CUSTOMER" &&
            isJoined ? (
              <button
                type="button"
                className="join-group-button"
                onClick={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Leaving..."
                  : "Leave Deal"}
              </button>
            ) : (
              <button
                type="button"
                className="join-group-button"
                onClick={handleJoin}
                disabled={
                  actionLoading ||
                  availableCapacity <= 0 ||
                  deal.status !== "ACTIVE"
                }
              >
                {actionLoading
                  ? "Joining..."
                  : availableCapacity <= 0
                  ? "Deal Full"
                  : deal.status !== "ACTIVE"
                  ? deal.status
                  : "Join Group"}
              </button>
            )}

            {/* NOTE */}
            {isJoined ? (
              <p className="join-note">
                ✓ You have joined this group
                deal.
              </p>
            ) : (
              <p className="join-note">
                Join before the deadline to
                participate in this group deal.
              </p>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default DealDetails;