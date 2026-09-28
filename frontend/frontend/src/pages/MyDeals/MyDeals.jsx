import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDeals } from "../../services/participationservice";
import "./MyDeals.css";

function MyDeals() {
  const [myDeals, setMyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyDeals();

        setMyDeals(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Load my deals error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load your deals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyDeals();
  }, []);

  if (loading) {
    return (
      <main className="my-deals-page">
        <div className="container">
          <p>Loading your deals...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="my-deals-page">
      <div className="container">

        <div className="my-deals-heading">
          <div>
            <span>My Purchases</span>

            <h1>My Deals</h1>

            <p>
              View the group deals you have joined.
            </p>
          </div>

          <Link
            to="/deals"
            className="browse-more-button"
          >
            Browse Deals
          </Link>
        </div>

        {error && (
          <div className="my-deals-error">
            {error}
          </div>
        )}

        {!error && myDeals.length > 0 ? (
          <div className="my-deals-list">

            {myDeals.map((deal) => {
              const groupPrice = Number(
                deal.group_price ?? 0
              );

              const status =
                deal.status ?? "ACTIVE";

              const deadline =
                deal.deadline;

              return (
                <div
                  className="my-deal-card"
                  key={deal.id}
                >
                  <div className="my-deal-icon">
                    🛍️
                  </div>

                  <div className="my-deal-info">

                    <div className="my-deal-title-row">
                      <h2>
                        {deal.product_name}
                      </h2>

                      <span
                        className={`my-status ${String(
                          status
                        ).toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="my-deal-details">

                      <div>
                        <small>
                          Group Price
                        </small>

                        <strong>
                          Rs.{" "}
                          {groupPrice.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Minimum Buyers
                        </small>

                        <strong>
                          {deal.minimum_buyers}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Deadline
                        </small>

                        <strong>
                          {deadline
                            ? new Date(
                                deadline
                              ).toLocaleString()
                            : "—"}
                        </strong>
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
              );
            })}

          </div>
        ) : !error ? (
          <div className="empty-my-deals">
            <div>🛒</div>

            <h2>
              No joined deals yet
            </h2>

            <p>
              Browse active deals and join your
              first group.
            </p>

            <Link to="/deals">
              Browse Deals
            </Link>
          </div>
        ) : null}

      </div>
    </main>
  );
}

export default MyDeals;