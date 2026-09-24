import { Link } from "react-router-dom";
import "./SellerDashboard.css";

function SellerDashboard() {
  const stats = [
    { title: "Total Deals", value: "12", icon: "📦" },
    { title: "Active Deals", value: "5", icon: "🔥" },
    { title: "Participants", value: "48", icon: "👥" },
    { title: "Successful Deals", value: "7", icon: "✅" },
  ];

  return (
    <main className="seller-dashboard">
      <div className="container">
        <div className="seller-dashboard-header">
          <div>
            <span className="seller-label">Seller Center</span>
            <h1>Seller Dashboard</h1>
            <p>Manage your group deals and track customer participation.</p>
          </div>

          <Link to="/seller/create-deal" className="create-deal-button">
            + Create Deal
          </Link>
        </div>

        <div className="seller-stats-grid">
          {stats.map((stat) => (
            <div className="seller-stat-card" key={stat.title}>
              <div className="seller-stat-icon">{stat.icon}</div>

              <div>
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <section className="seller-actions-section">
          <h2>Quick Actions</h2>

          <div className="seller-actions-grid">
            <Link to="/seller/create-deal" className="seller-action-card">
              <span>➕</span>
              <div>
                <h3>Create Deal</h3>
                <p>Create a new group buying offer.</p>
              </div>
            </Link>

            <Link to="/seller/deals" className="seller-action-card">
              <span>📋</span>
              <div>
                <h3>My Deals</h3>
                <p>View and manage your existing deals.</p>
              </div>
            </Link>

            <Link to="/seller/import-csv" className="seller-action-card">
              <span>📄</span>
              <div>
                <h3>Import CSV</h3>
                <p>Create multiple deals using a CSV file.</p>
              </div>
            </Link>

            <Link to="/seller/reports" className="seller-action-card">
              <span>📊</span>
              <div>
                <h3>Reports</h3>
                <p>View deal outcomes and participation.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="recent-deals-section">
          <div className="recent-deals-heading">
            <h2>Recent Deals</h2>
            <Link to="/seller/deals">View All →</Link>
          </div>

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
                <tr>
                  <td>Smart Watch</td>
                  <td>Rs. 6,500</td>
                  <td>3 / 5</td>
                  <td>
                    <span className="seller-status active">ACTIVE</span>
                  </td>
                </tr>

                <tr>
                  <td>Wireless Mouse</td>
                  <td>Rs. 2,800</td>
                  <td>5 / 5</td>
                  <td>
                    <span className="seller-status successful">
                      SUCCESSFUL
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>Laptop Bag</td>
                  <td>Rs. 4,000</td>
                  <td>2 / 4</td>
                  <td>
                    <span className="seller-status active">ACTIVE</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SellerDashboard;