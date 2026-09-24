import { useParams, Link } from "react-router-dom";
import "./DealDetails.css";

function DealDetails() {
  const { dealId } = useParams();

  // Temporary data - backend connection later
  const deal = {
    id: dealId,
    productName: "Smart Watch",
    description:
      "Special group buying offer for a smart watch. Join other buyers before the deadline and unlock the group price.",
    normalPrice: 8500,
    groupPrice: 6500,
    minimumBuyers: 5,
    maximumQuantity: 10,
    currentBuyers: 3,
    deadline: "2 days left",
    status: "ACTIVE",
    icon: "⌚",
  };

  const remainingBuyers = Math.max(
    deal.minimumBuyers - deal.currentBuyers,
    0
  );

  const availableCapacity =
    deal.maximumQuantity - deal.currentBuyers;

  const progress = Math.min(
    (deal.currentBuyers / deal.minimumBuyers) * 100,
    100
  );

  const savings = deal.normalPrice - deal.groupPrice;

  const savingsPercentage = Math.round(
    (savings / deal.normalPrice) * 100
  );

  const handleJoin = () => {
    // POST /deals/{deal_id}/join will be connected later
    alert("Join Group clicked!");
  };

  return (
    <main className="deal-details-page">
      <div className="container">

        <Link to="/deals" className="back-deals">
          ← Back to Deals
        </Link>

        <div className="deal-details-grid">

          <div className="deal-visual">
            <span className="details-status">
              {deal.status}
            </span>

            <div className="details-product-icon">
              {deal.icon}
            </div>
          </div>

          <div className="deal-information">
            <span className="details-label">
              Group Deal
            </span>

            <h1>{deal.productName}</h1>

            <p className="details-description">
              {deal.description}
            </p>

            <div className="details-price-section">
              <div>
                <span className="price-title">
                  Normal Price
                </span>

                <span className="details-normal-price">
                  Rs. {deal.normalPrice.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="price-title">
                  Group Price
                </span>

                <span className="details-group-price">
                  Rs. {deal.groupPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="saving-box">
              You save{" "}
              <strong>
                Rs. {savings.toLocaleString()}
              </strong>{" "}
              ({savingsPercentage}%)
            </div>

            <div className="group-progress-section">
              <div className="progress-heading">
                <span>
                  {deal.currentBuyers} buyers joined
                </span>

                <span>
                  Target: {deal.minimumBuyers}
                </span>
              </div>

              <div className="details-progress">
                <div
                  className="details-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="remaining-text">
                {remainingBuyers > 0
                  ? `${remainingBuyers} more buyer${
                      remainingBuyers > 1 ? "s" : ""
                    } needed to reach the target.`
                  : "Group target reached!"}
              </p>
            </div>

            <div className="deal-stat-grid">
              <div className="deal-stat">
                <span>👥</span>

                <div>
                  <small>Joined</small>
                  <strong>{deal.currentBuyers}</strong>
                </div>
              </div>

              <div className="deal-stat">
                <span>📦</span>

                <div>
                  <small>Available</small>
                  <strong>{availableCapacity}</strong>
                </div>
              </div>

              <div className="deal-stat">
                <span>⏱️</span>

                <div>
                  <small>Deadline</small>
                  <strong>{deal.deadline}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="join-group-button"
              onClick={handleJoin}
              disabled={availableCapacity <= 0}
            >
              {availableCapacity > 0
                ? "Join Group"
                : "Deal Full"}
            </button>

            <p className="join-note">
              Join before the deadline to participate in
              this group deal.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default DealDetails;