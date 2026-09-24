import { Link } from "react-router-dom";
import "./MyDeals.css";

function MyDeals() {
  // Temporary data - GET /participations/my-deals later
  const myDeals = [
    {
      id: 1,
      productName: "Smart Watch",
      groupPrice: 6500,
      status: "ACTIVE",
      joinedAt: "24 Sep 2026",
      deadline: "2 days left",
      icon: "⌚",
    },
    {
      id: 2,
      productName: "Wireless Headphones",
      groupPrice: 9000,
      status: "SUCCESSFUL",
      joinedAt: "22 Sep 2026",
      deadline: "Completed",
      icon: "🎧",
    },
  ];

  return (
    <main className="my-deals-page">
      <div className="container">
        <div className="my-deals-heading">
          <div>
            <span>My Purchases</span>
            <h1>My Deals</h1>
            <p>View the group deals you have joined.</p>
          </div>

          <Link to="/deals" className="browse-more-button">
            Browse Deals
          </Link>
        </div>

        {myDeals.length > 0 ? (
          <div className="my-deals-list">
            {myDeals.map((deal) => (
              <div className="my-deal-card" key={deal.id}>
                <div className="my-deal-icon">
                  {deal.icon}
                </div>

                <div className="my-deal-info">
                  <div className="my-deal-title-row">
                    <h2>{deal.productName}</h2>

                    <span
                      className={`my-status ${deal.status.toLowerCase()}`}
                    >
                      {deal.status}
                    </span>
                  </div>

                  <div className="my-deal-details">
                    <div>
                      <small>Group Price</small>
                      <strong>
                        Rs. {deal.groupPrice.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <small>Joined</small>
                      <strong>{deal.joinedAt}</strong>
                    </div>

                    <div>
                      <small>Deadline</small>
                      <strong>{deal.deadline}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/deals/${deal.id}`}
                  className="my-view-button"
                >
                  View Deal
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-my-deals">
            <div>🛒</div>
            <h2>No joined deals yet</h2>
            <p>Browse active deals and join your first group.</p>

            <Link to="/deals">
              Browse Deals
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyDeals;