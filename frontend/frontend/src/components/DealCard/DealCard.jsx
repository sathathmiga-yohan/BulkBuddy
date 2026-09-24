import { Link } from "react-router-dom";
import "./DealCard.css";

function DealCard({ deal }) {
  const progress = Math.min(
    (deal.currentBuyers / deal.minimumBuyers) * 100,
    100
  );

  const remainingBuyers = Math.max(
    deal.minimumBuyers - deal.currentBuyers,
    0
  );

  return (
    <article className="deal-card">
      <div className="deal-card-top">
        <span className="deal-badge">Group Deal</span>

        <div className="deal-product-icon">
          {deal.icon}
        </div>
      </div>

      <div className="deal-card-body">
        <h3>{deal.productName}</h3>

        <p className="deal-description">
          {deal.description}
        </p>

        <div className="deal-prices">
          <span className="normal-price">
            Rs. {deal.normalPrice.toLocaleString()}
          </span>

          <span className="group-price">
            Rs. {deal.groupPrice.toLocaleString()}
          </span>
        </div>

        <div className="deal-progress-info">
          <span>
            {deal.currentBuyers} joined
          </span>

          <span>
            {remainingBuyers === 0
              ? "Target reached!"
              : `${remainingBuyers} more needed`}
          </span>
        </div>

        <div className="deal-progress">
          <div
            className="deal-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="deal-card-footer">
          <span className="deal-deadline">
            ⏱ {deal.deadline}
          </span>

          <Link
            to={`/deals/${deal.id}`}
            className="view-deal-button"
          >
            View Deal
          </Link>
        </div>
      </div>
    </article>
  );
}

export default DealCard;