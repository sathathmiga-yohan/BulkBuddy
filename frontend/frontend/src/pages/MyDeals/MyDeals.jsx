
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";

import { formatPrice } from "../../data/mockDeals.js";

import { getCurrentUser, logoutUser } from "../../services/authservice"; 
import { getDealById } from "../../services/dealservice";
import { getMyParticipations } from "../../services/participationservice";

import "./MyDeals.css";

const filters = [
  "all",
  "active",
  "waiting",
  "successful",
  "failed",
  "cancelled",
];

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return fallback;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
}

function getDealStatus(item) {
  const participationStatus = String(
    item.status || ""
  ).toUpperCase();

  const dealStatus = String(
    item.deal?.status || ""
  ).toUpperCase();

  if (participationStatus === "CANCELLED") {
    return "cancelled";
  }

  if (participationStatus === "WAITING") {
    return "waiting";
  }

  if (dealStatus === "SUCCESSFUL") {
    return "successful";
  }

  if (dealStatus === "FAILED") {
    return "failed";
  }

  return "active";
}

export default function MyDeals() {
  const navigate = useNavigate();

  const [page, setPage] = useState("deals");
  const [filter, setFilter] = useState("all");

  const [profile, setProfile] = useState(null);
  const [joinedDeals, setJoinedDeals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [user, participations] = await Promise.all([
          getCurrentUser(),
          getMyParticipations(),
        ]);

        const dealsWithDetails = await Promise.all(
          participations.map(async (participation) => {
            try {
              const deal = await getDealById(
                participation.deal_id
              );

              return {
                ...participation,
                deal,
              };
            } catch (dealError) {
              console.error(
                `Unable to load deal ${participation.deal_id}:`,
                dealError
              );

              return {
                ...participation,
                deal: null,
              };
            }
          })
        );

        if (!cancelled) {
          setProfile(user);
          setJoinedDeals(dealsWithDetails);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load your dashboard."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleDeals = joinedDeals.filter((item) => {
    return (
      filter === "all" ||
      getDealStatus(item) === filter
    );
  });

  const counts = {
    all: joinedDeals.length,

    active: joinedDeals.filter(
      (item) => getDealStatus(item) === "active"
    ).length,

    waiting: joinedDeals.filter(
      (item) => getDealStatus(item) === "waiting"
    ).length,

    successful: joinedDeals.filter(
      (item) => getDealStatus(item) === "successful"
    ).length,

    failed: joinedDeals.filter(
      (item) => getDealStatus(item) === "failed"
    ).length,

    cancelled: joinedDeals.filter(
      (item) => getDealStatus(item) === "cancelled"
    ).length,
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <main className="mydeals-page">
      <div className="mydeals-layout">
        {/* SIDEBAR */}
        <aside className="mydeals-sidebar">
          <div className="mydeals-user">
            <div className="mydeals-avatar">
              <UserRound size={27} />
            </div>

            <strong>
              {profile?.name || "Customer"}
            </strong>

            <span>Customer Account</span>
          </div>

          <nav className="mydeals-navigation">
            <button
              type="button"
              className={
                page === "deals" ? "active" : ""
              }
              onClick={() => setPage("deals")}
            >
              <Package size={18} />
              My Deals
            </button>

            <button
              type="button"
              className={
                page === "profile" ? "active" : ""
              }
              onClick={() => setPage("profile")}
            >
              <UserRound size={18} />
              My Profile
            </button>
          </nav>

          <div className="mydeals-sidebar-bottom">
            <Link to="/deals">
              <ShoppingBag size={18} />
              Explore Deals
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="mydeals-main">
          {loading && (
            <section className="mydeals-panel" role="status">
              <p>Loading your dashboard...</p>
            </section>
          )}

          {error && (
            <section className="mydeals-panel" role="alert">
              <h2>Unable to load dashboard</h2>
              <p>{error}</p>
            </section>
          )}

          {!loading && !error && page === "deals" && (
            <>
              {/* HEADER */}
              <header className="mydeals-header">
                <div>
                  <small>CUSTOMER DASHBOARD</small>

                  <h1>My Deals</h1>

                  <p>
                    Track all your group buying
                    participations.
                  </p>
                </div>

                <Link
                  className="mydeals-primary"
                  to="/deals"
                >
                  Explore Deals
                  <ArrowRight size={17} />
                </Link>
              </header>

              {/* STATISTICS */}
              <div className="mydeals-stats">
                {[
                  {
                    key: "all",
                    title: "Total Participations",
                    icon: ShoppingBag,
                  },
                  {
                    key: "active",
                    title: "Active Deals",
                    icon: Clock3,
                  },
                  {
                    key: "successful",
                    title: "Successful",
                    icon: CheckCircle2,
                  },
                  {
                    key: "failed",
                    title: "Failed Deals",
                    icon: XCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="mydeals-stat"
                      key={item.key}
                    >
                      <div
                        className={`mydeals-stat-icon ${item.key}`}
                      >
                        <Icon size={22} />
                      </div>

                      <span>{item.title}</span>

                      <strong>
                        {counts[item.key]}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* JOINED DEALS */}
              <section className="mydeals-panel">
                <div className="mydeals-panel-title">
                  <h2>My Group Deals</h2>

                  <span>
                    {visibleDeals.length} deals
                  </span>
                </div>

                {/* FILTERS */}
                <div className="mydeals-filters">
                  {filters.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        filter === value
                          ? "active"
                          : ""
                      }
                      onClick={() => setFilter(value)}
                    >
                      {value === "all"
                        ? "All Deals"
                        : value[0].toUpperCase() +
                        value.slice(1)}
                    </button>
                  ))}
                </div>

                {/* DEAL CARDS */}
                <div className="mydeals-list">
                  {visibleDeals.map((item) => {
                    const deal = item.deal;
                    const status = getDealStatus(item);

                    const groupPrice = deal
                      ? Number(deal.group_price)
                      : null;

                    return (
                      <article
                        className="mydeals-card"
                        key={item.id}
                      >
                        <div className="mydeals-card-body">
                          <div className="mydeals-card-top">
                            <span>
                              Deal #{item.deal_id}
                            </span>

                            <span
                              className={`mydeals-status ${status}`}
                            >
                              {status}
                            </span>
                          </div>

                          <h3>
                            {deal?.product_name ||
                              `Deal #${item.deal_id}`}
                          </h3>

                          <p>
                            Joined:{" "}
                            {formatDate(item.joined_at)}
                          </p>

                          <div className="mydeals-prices">
                            <div>
                              <small>
                                Group Price
                              </small>

                              <strong>
                                {groupPrice !== null
                                  ? formatPrice(groupPrice)
                                  : "Unavailable"}
                              </strong>
                            </div>

                            <div>
                              <small>
                                Participation
                              </small>

                              <strong>
                                {String(item.status)}
                              </strong>
                            </div>

                            {item.waiting_position != null && (
                              <div>
                                <small>
                                  Waiting Position
                                </small>

                                <strong>
                                  {item.waiting_position}
                                </strong>
                              </div>
                            )}
                          </div>

                          {deal && (
                            <div className="mydeals-progress-label">
                              <span>
                                <Package size={14} />

                                Minimum{" "}
                                {deal.minimum_buyers}{" "}
                                buyers
                              </span>

                              <strong>
                                Capacity{" "}
                                {deal.maximum_quantity}
                              </strong>
                            </div>
                          )}

                          <div className="mydeals-card-footer">
                            <span>
                              {status === "active"
                                ? "Participation active"
                                : status === "waiting"
                                  ? "On waiting list"
                                  : status === "successful"
                                    ? "Deal successful"
                                    : status === "failed"
                                      ? "Deal failed"
                                      : "Participation cancelled"}
                            </span>

                            <Link
                              to={`/deals/${item.deal_id}`}
                            >
                              View Details
                              <ArrowRight size={15} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {visibleDeals.length === 0 && (
                    <div className="mydeals-empty">
                      <Package size={35} />

                      <h3>No deals found</h3>

                      <p>
                        No participations available
                        for this filter.
                      </p>

                      <Link to="/deals">
                        Explore Deals
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* PROFILE - READ ONLY UNTIL UPDATE API EXISTS */}
          {!loading && !error && page === "profile" && (
            <>
              <header className="mydeals-header">
                <div>
                  <small>CUSTOMER DASHBOARD</small>

                  <h1>My Profile</h1>

                  <p>
                    Your registered account information.
                  </p>
                </div>
              </header>

              <section className="mydeals-panel mydeals-form-panel">
                <h2>Personal Information</h2>

                <label>
                  Full Name

                  <input
                    type="text"
                    value={profile?.name || ""}
                    readOnly
                  />
                </label>

                <label>
                  Email

                  <input
                    type="email"
                    value={profile?.email || ""}
                    readOnly
                  />
                </label>

                <label>
                  Account Role

                  <input
                    type="text"
                    value={profile?.role || "CUSTOMER"}
                    readOnly
                  />
                </label>

                <p>
                  Profile editing is not available
                  through the current Backend API.
                </p>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
