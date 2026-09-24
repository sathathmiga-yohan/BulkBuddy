import { Link } from "react-router-dom";
import "./Reports.css";

function Reports() {
  // Temporary frontend data
  // Backend report API connect pannumbothu replace pannuvom.

  const summary = {
    totalDeals: 12,
    activeDeals: 5,
    successfulDeals: 6,
    failedDeals: 1,
    totalParticipants: 48,
  };

  const reportData = [
    {
      id: 1,
      productName: "Smart Watch",
      participants: 3,
      minimumBuyers: 5,
      status: "ACTIVE",
      groupPrice: 6500,
    },
    {
      id: 2,
      productName: "Wireless Headphones",
      participants: 6,
      minimumBuyers: 6,
      status: "SUCCESSFUL",
      groupPrice: 9000,
    },
    {
      id: 3,
      productName: "Laptop Bag",
      participants: 2,
      minimumBuyers: 4,
      status: "ACTIVE",
      groupPrice: 4000,
    },
    {
      id: 4,
      productName: "Bluetooth Speaker",
      participants: 2,
      minimumBuyers: 5,
      status: "FAILED",
      groupPrice: 5500,
    },
  ];

  return (
    <main className="reports-page">
      <div className="container">

        <Link
          to="/seller/dashboard"
          className="reports-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="reports-header">
          <span>Seller Center</span>

          <h1>Deal Reports</h1>

          <p>
            Track your deal performance and customer
            participation.
          </p>
        </div>

        <div className="report-summary-grid">

          <div className="report-summary-card">
            <div className="report-icon">📦</div>
            <div>
              <p>Total Deals</p>
              <h2>{summary.totalDeals}</h2>
            </div>
          </div>

          <div className="report-summary-card">
            <div className="report-icon">🔥</div>
            <div>
              <p>Active Deals</p>
              <h2>{summary.activeDeals}</h2>
            </div>
          </div>

          <div className="report-summary-card">
            <div className="report-icon">✅</div>
            <div>
              <p>Successful</p>
              <h2>{summary.successfulDeals}</h2>
            </div>
          </div>

          <div className="report-summary-card">
            <div className="report-icon">👥</div>
            <div>
              <p>Participants</p>
              <h2>{summary.totalParticipants}</h2>
            </div>
          </div>

        </div>

        <section className="report-section">
          <div className="report-section-heading">
            <div>
              <h2>Deal Performance</h2>
              <p>
                Summary of participation and deal outcomes.
              </p>
            </div>
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">

              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Group Price</th>
                  <th>Participants</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reportData.map((deal) => {
                  const progress = Math.min(
                    (deal.participants / deal.minimumBuyers) * 100,
                    100
                  );

                  return (
                    <tr key={deal.id}>
                      <td className="report-product">
                        {deal.productName}
                      </td>

                      <td>
                        Rs. {deal.groupPrice.toLocaleString()}
                      </td>

                      <td>{deal.participants}</td>

                      <td>{deal.minimumBuyers}</td>

                      <td>
                        <div className="report-progress-wrapper">
                          <div className="report-progress">
                            <div
                              className="report-progress-fill"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <span>
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`report-status ${deal.status.toLowerCase()}`}
                        >
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Reports;