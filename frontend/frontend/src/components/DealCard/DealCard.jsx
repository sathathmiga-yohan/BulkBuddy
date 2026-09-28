import { Link } from "react-router-dom";
import "./DealCard.css";

function DealCard({ deal }) {
  const currentBuyers = Number(
    deal.currentBuyers ?? 0
  );

  const minimumBuyers = Number(
    deal.minimumBuyers ?? 0
  );

  const normalPrice = Number(
    deal.normalPrice ?? 0
  );

  const groupPrice = Number(
    deal.groupPrice ?? 0
  );

  // ==========================================
  // PROGRESS
  // ==========================================
  const progress =
    minimumBuyers > 0
      ? Math.min(
          (currentBuyers / minimumBuyers) * 100,
          100
        )
      : 0;

  // ==========================================
  // REMAINING BUYERS
  // ==========================================
  const remainingBuyers = Math.max(
    minimumBuyers - currentBuyers,
    0
  );

  // ==========================================
  // DEADLINE
  // ==========================================
  const formattedDeadline = deal.deadline
    ? new Date(deal.deadline).toLocaleString()
    : "No deadline";

  return (
    <article className="deal-card">

      {/* TOP */}
      <div className="deal-card-top">

        <span className="deal-badge">
          Group Deal
        </span>

        <div className="deal-product-icon">
          {deal.icon || "🛍️"}
        </div>

      </div>

      {/* BODY */}
      <div className="deal-card-body">

        <h3>
          {deal.productName}
        </h3>

        <p className="deal-description">
          {deal.description ||
            "No description available."}
        </p>

        {/* PRICES */}
        <div className="deal-prices">

          <span className="normal-price">
            Rs.{" "}
            {normalPrice.toLocaleString()}
          </span>

          <span className="group-price">
            Rs.{" "}
            {groupPrice.toLocaleString()}
          </span>

        </div>

        {/* PARTICIPATION */}
        <div className="deal-progress-info">

          <span>
            {currentBuyers} joined
          </span>

          <span>
            {remainingBuyers === 0
              ? "Target reached!"
              : `${remainingBuyers} more needed`}
          </span>

        </div>

        {/* PROGRESS BAR */}
        <div className="deal-progress">

          <div
            className="deal-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* FOOTER */}
        <div className="deal-card-footer">

          <span className="deal-deadline">
            ⏱ {formattedDeadline}
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