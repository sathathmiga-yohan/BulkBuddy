
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Users
} from "lucide-react";

import {
  mockDeals,
  formatPrice
} from "../../data/mockDeals.js";

import "./DealsDetails.css";

const getDeadline = (daysLeft) => {
  const deadline = new Date();

  deadline.setDate(
    deadline.getDate() + daysLeft
  );

  deadline.setHours(23, 59, 59, 999);

  return deadline;
};

function getTimeRemaining(deadline) {
  const difference = Math.max(
    deadline.getTime() - Date.now(),
    0
  );

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    )
  };
}

function Countdown({ deadline }) {
  const [remaining, setRemaining] = useState(
    () => getTimeRemaining(deadline)
  );

  useEffect(() => {
    setRemaining(getTimeRemaining(deadline));

    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Mins", value: remaining.minutes },
    { label: "Secs", value: remaining.seconds }
  ];

  return (
    <div className="detail-countdown">
      {units.map((unit) => (
        <div
          className="detail-countdown-unit"
          key={unit.label}
        >
          <strong>
            {String(unit.value).padStart(2, "0")}
          </strong>

          <span>{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DealDetails() {
  const { id } = useParams();

  const deal = mockDeals.find(
    (item) => item.id === Number(id)
  );

  if (!deal) {
    return (
      <main className="detail-not-found">
        <h1>Deal not found</h1>

        <p>
          This deal may no longer be available.
        </p>

        <Link to="/deals">
          <ArrowLeft size={17} />
          Back to Deals
        </Link>
      </main>
    );
  }

  return (
    <DealDetailsContent
      key={deal.id}
      deal={deal}
    />
  );
}

function DealDetailsContent({ deal }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavourite, setIsFavourite] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("description");

  const [selectedImage, setSelectedImage] =
    useState(deal.image);

  const [showJoinMessage, setShowJoinMessage] =
    useState(false);

  const [demoJoined, setDemoJoined] =
    useState(false);

  const [deadline] = useState(
    () => getDeadline(deal.daysLeft)
  );

  const images = [
    deal.image,
    deal.image,
    deal.image
  ];

  const joinedCount =
    deal.joined + (demoJoined ? quantity : 0);

  const availableQuantity = Math.max(
    deal.maxQuantity - joinedCount,
    0
  );

  const progress = Math.min(
    (joinedCount / deal.required) * 100,
    100
  );

  const handleJoin = () => {
    if (demoJoined || availableQuantity < quantity) {
      return;
    }

    setDemoJoined(true);
    setShowJoinMessage(true);
  };

  return (
    <main className="detail-page">
      <div className="detail-container">

        {/* BREADCRUMB */}

        <nav
          className="detail-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/deals">Deals</Link>
          <span>/</span>
          <strong>{deal.name}</strong>
        </nav>

        {/* MAIN PRODUCT SECTION */}

        <section className="detail-product-layout">

          {/* LEFT: PRODUCT IMAGES */}

          <div className="detail-gallery">
            <div className="detail-main-image">
              <img
                src={selectedImage}
                alt={deal.name}
              />

              <span className="detail-discount">
                {deal.discount}% OFF
              </span>
            </div>

            <div className="detail-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  className={
                    selectedImage === image &&
                    index === 0
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedImage(image)
                  }
                  aria-label={
                    `View product image ${index + 1}`
                  }
                >
                  <img
                    src={image}
                    alt={`${deal.name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>

            <p className="detail-image-note">
              Product images are for demonstration.
            </p>
          </div>

          {/* RIGHT: PRODUCT DETAILS */}

          <div className="detail-information">

            <div className="detail-category-row">
              <span className="detail-category">
                {deal.category}
              </span>

              <span className="detail-rating">
                <Star
                  size={15}
                  fill="currentColor"
                />

                {deal.rating}
                <small>(Demo rating)</small>
              </span>
            </div>

            <h1>{deal.name}</h1>

            <p className="detail-seller">
              Sold by{" "}
              <strong>{deal.seller}</strong>
            </p>

            <p className="detail-description">
              {deal.description}
            </p>

            {/* PRICE */}

            <div className="detail-price-box">
              <span className="detail-price-label">
                EXCLUSIVE GROUP PRICE
              </span>

              <div className="detail-prices">
                <strong>
                  {formatPrice(deal.groupPrice)}
                </strong>

                <del>
                  {formatPrice(deal.originalPrice)}
                </del>
              </div>

              <span className="detail-saving">
                Save{" "}
                {formatPrice(
                  deal.originalPrice -
                  deal.groupPrice
                )}
              </span>
            </div>

            {/* GROUP BUYING INFORMATION */}

            <div className="detail-group-box">
              <div className="detail-group-title">
                <h2>
                  <Users size={19} />
                  Group Buying Progress
                </h2>

                <span className="detail-live-badge">
                  ACTIVE DEAL
                </span>
              </div>

              <div className="detail-progress-numbers">
                <div>
                  <strong>{joinedCount}</strong>
                  <span>Buyers Joined</span>
                </div>

                <div>
                  <strong>{deal.required}</strong>
                  <span>Minimum Buyers</span>
                </div>

                <div>
                  <strong>
                    {availableQuantity}
                  </strong>
                  <span>Spots Left</span>
                </div>
              </div>

              <div
                className="detail-progress-track"
                role="progressbar"
                aria-label="Buyers joined"
                aria-valuenow={Math.min(
                  joinedCount,
                  deal.required
                )}
                aria-valuemin={0}
                aria-valuemax={deal.required}
              >
                <div
                  style={{
                    width: `${progress}%`
                  }}
                />
              </div>

              <p className="detail-progress-message">
                {joinedCount >= deal.required
                  ? "Minimum buyer target reached!"
                  : `${
                      deal.required - joinedCount
                    } more buyers needed to unlock this deal.`}
              </p>
            </div>

            {/* COUNTDOWN */}

            <div className="detail-deadline-box">
              <div className="detail-deadline-heading">
                <Clock3 size={18} />
                <strong>Deal Ends In</strong>
              </div>

              <Countdown deadline={deadline} />
            </div>

            {/* QUANTITY */}

            <div className="detail-quantity-row">
              <div>
                <strong>Quantity</strong>
                <p>
                  Maximum {deal.maxQuantity} units
                  in this mock deal
                </p>
              </div>

              <div className="detail-quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={
                    quantity <= 1 || demoJoined
                  }
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(
                        availableQuantity,
                        current + 1
                      )
                    )
                  }
                  disabled={
                    quantity >= availableQuantity ||
                    demoJoined
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="detail-actions">
              <button
                type="button"
                className="detail-join-button"
                onClick={handleJoin}
                disabled={
                  demoJoined ||
                  availableQuantity === 0
                }
              >
                {demoJoined ? (
                  <>
                    <CheckCircle2 size={19} />
                    Joined (Demo)
                  </>
                ) : (
                  <>
                    <ShoppingBag size={19} />
                    Join Group Deal
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                type="button"
                className={`detail-wishlist-button ${
                  isFavourite ? "active" : ""
                }`}
                onClick={() =>
                  setIsFavourite((current) => !current)
                }
                aria-pressed={isFavourite}
              >
                <Heart
                  size={19}
                  fill={
                    isFavourite
                      ? "currentColor"
                      : "none"
                  }
                />

                {isFavourite
                  ? "Wishlisted"
                  : "Add to Wishlist"}
              </button>
            </div>

            {showJoinMessage && (
              <div
                className="detail-join-message"
                role="status"
              >
                <CheckCircle2 size={19} />

                <p>
                  Demo successful! Your selected
                  quantity has been added to the
                  on-screen buyer count. No actual
                  order has been placed.
                </p>
              </div>
            )}

            {/* TRUST INFO */}

            <div className="detail-trust-row">
              <span>
                <ShieldCheck size={17} />
                Trusted Seller
              </span>

              <span>
                <Truck size={17} />
                Delivery After Success
              </span>
            </div>

          </div>
        </section>

        {/* DETAILS TABS */}

        <section className="detail-tabs-section">
          <div
            className="detail-tabs"
            role="tablist"
            aria-label="Product information"
          >
            {[
              ["description", "Description"],
              ["specifications", "Specifications"],
              ["reviews", "Reviews"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={activeTab === value}
                className={
                  activeTab === value ? "active" : ""
                }
                onClick={() => setActiveTab(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="detail-tab-content">
            {activeTab === "description" && (
              <div>
                <h2>Product Description</h2>

                <p>{deal.description}</p>

                <p>
                  Join this group deal with other
                  BulkBuddy shoppers. When the minimum
                  number of buyers is reached before
                  the deadline, the deal can proceed
                  at the group price.
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h2>Product Specifications</h2>

                <table className="detail-spec-table">
                  <tbody>
                    <tr>
                      <th>Product</th>
                      <td>{deal.name}</td>
                    </tr>

                    <tr>
                      <th>Category</th>
                      <td>{deal.category}</td>
                    </tr>

                    <tr>
                      <th>Seller</th>
                      <td>{deal.seller}</td>
                    </tr>

                    <tr>
                      <th>Minimum Buyers</th>
                      <td>{deal.required}</td>
                    </tr>

                    <tr>
                      <th>Maximum Quantity</th>
                      <td>{deal.maxQuantity}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="detail-spec-note">
                  Detailed technical specifications
                  will be supplied by sellers.
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2>Customer Reviews</h2>

                <div className="detail-reviews-empty">
                  <Star size={30} />

                  <p>
                    Verified customer reviews
                    will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BACK LINK */}

        <Link
          to="/deals"
          className="detail-back-link"
        >
          <ArrowLeft size={17} />
          Back to All Deals
        </Link>

      </div>
    </main>
  );
}
