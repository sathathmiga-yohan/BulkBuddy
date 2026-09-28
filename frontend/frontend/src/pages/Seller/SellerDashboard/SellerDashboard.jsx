import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerDeals } from "../../../services/dealservice";
import "./SellerDashboard.css";

function SellerDashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SELLER DEALS
  // ==========================================
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSellerDeals();

        setDeals(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================
  // PARTICIPANT COUNT
  // ==========================================
  const getParticipantCount = (deal) => {
    return Number(
      deal.current_participants ?? 0
    );
  };

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  const totalDeals = deals.length;

  const activeDeals = deals.filter(
    (deal) => deal.status === "ACTIVE"
  ).length;

  const successfulDeals = deals.filter(
    (deal) => deal.status === "SUCCESSFUL"
  ).length;

  const totalParticipants = deals.reduce(
    (total, deal) => {
      return (
        total +
        getParticipantCount(deal)
      );
    },
    0
  );

  const stats = [
    {
      title: "Total Deals",
      value: totalDeals,
      icon: "📦",
    },
    {
      title: "Active Deals",
      value: activeDeals,
      icon: "🔥",
    },
    {
      title: "Participants",
      value: totalParticipants,
      icon: "👥",
    },
    {
      title: "Successful Deals",
      value: successfulDeals,
      icon: "✅",
    },
  ];

  // Backend returns newest deals first
  const recentDeals = deals.slice(0, 3);

  return (
    <main className="seller-dashboard">
      <div className="container">

        {/* HEADER */}
        <div className="seller-dashboard-header">
          <div>
            <span className="seller-label">
              Seller Center
            </span>

            <h1>Seller Dashboard</h1>

            <p>
              Manage your group deals and track
              customer participation.
            </p>
          </div>

          <Link
            to="/seller/create-deal"
            className="create-deal-button"
          >
            + Create Deal
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="seller-dashboard-error">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="seller-stats-grid">
          {stats.map((stat) => (
            <div
              className="seller-stat-card"
              key={stat.title}
            >
              <div className="seller-stat-icon">
                {stat.icon}
              </div>

              <div>
                <p>{stat.title}</p>

                <h2>
                  {loading
                    ? "..."
                    : stat.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <section className="seller-actions-section">
          <h2>Quick Actions</h2>

          <div className="seller-actions-grid">

            <Link
              to="/seller/create-deal"
              className="seller-action-card"
            >
              <span>➕</span>

              <div>
                <h3>Create Deal</h3>

                <p>
                  Create a new group buying offer.
                </p>
              </div>
            </Link>

            <Link
              to="/seller/deals"
              className="seller-action-card"
            >
              <span>📋</span>

              <div>
                <h3>My Deals</h3>

                <p>
                  View and manage your existing
                  deals.
                </p>
              </div>
            </Link>

            <Link
              to="/seller/import-csv"
              className="seller-action-card"
            >
              <span>📄</span>

              <div>
                <h3>Import CSV</h3>

                <p>
                  Create multiple deals using a
                  CSV file.
                </p>
              </div>
            </Link>

            <Link
              to="/seller/reports"
              className="seller-action-card"
            >
              <span>📊</span>

              <div>
                <h3>Reports</h3>

                <p>
                  View deal outcomes and
                  participation.
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* RECENT DEALS */}
        <section className="recent-deals-section">

          <div className="recent-deals-heading">
            <h2>Recent Deals</h2>

            <Link to="/seller/deals">
              View All →
            </Link>
          </div>

          {loading ? (
            <p>Loading recent deals...</p>
          ) : recentDeals.length === 0 ? (
            <p>No deals created yet.</p>
          ) : (
            <div className="seller-table-wrapper">

              <table className="seller-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Group Price</th>
                    <th>Buyers</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentDeals.map((deal) => {

                    const groupPrice =
                      Number(
                        deal.group_price ?? 0
                      );

                    const minimumBuyers =
                      Number(
                        deal.minimum_buyers ?? 0
                      );

                    const buyers =
                      getParticipantCount(deal);

                    const status =
                      deal.status || "ACTIVE";

                    return (
                      <tr key={deal.id}>

                        <td>
                          {deal.product_name}
                        </td>

                        <td>
                          Rs.{" "}
                          {groupPrice.toLocaleString()}
                        </td>

                        <td>
                          {buyers} /{" "}
                          {minimumBuyers}
                        </td>

                        <td>
                          <span
                            className={`seller-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

export default SellerDashboard;