
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Users,
  ShieldCheck,
  Truck,
  BadgePercent,
  Clock3,
  ShoppingBag,
  Star
} from "lucide-react";

import "./Home.css";

const benefits = [
  {
    icon: Users,
    title: "Group Buying",
    description:
      "Join other shoppers and unlock better prices together."
  },
  {
    icon: BadgePercent,
    title: "Big Savings",
    description:
      "Enjoy exclusive discounts on your favourite products."
  },
  {
    icon: ShieldCheck,
    title: "Trusted Sellers",
    description:
      "Shop confidently with our trusted marketplace sellers."
  },
  {
    icon: Truck,
    title: "Easy Delivery",
    description:
      "Get your group purchases delivered to your doorstep."
  }
];

const trendingDeals = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85",
    originalPrice: 18000,
    groupPrice: 12999,
    joined: 16,
    required: 20,
    daysLeft: 3,
    rating: 4.8,
    discount: 28
  },
  {
    id: 2,
    name: "Smart Watch Series Pro",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85",
    originalPrice: 25000,
    groupPrice: 18999,
    joined: 12,
    required: 15,
    daysLeft: 5,
    rating: 4.9,
    discount: 24
  },
  {
    id: 3,
    name: "Professional DSLR Camera",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85",
    originalPrice: 150000,
    groupPrice: 119999,
    joined: 7,
    required: 10,
    daysLeft: 2,
    rating: 4.7,
    discount: 20
  },
  {
    id: 4,
    name: "Modern Running Sneakers",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85",
    originalPrice: 16000,
    groupPrice: 10999,
    joined: 18,
    required: 25,
    daysLeft: 4,
    rating: 4.8,
    discount: 31
  }
];

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0
  }).format(amount);

function DealCard({ deal }) {
  const progress = Math.min(
    (deal.joined / deal.required) * 100,
    100
  );

  return (
    <article className="home-deal-card">
      <div className="home-deal-image-wrap">
        <img src={deal.image} alt={deal.name} />

        <span className="home-discount">
          -{deal.discount}%
        </span>

        <span className="home-days-left">
          <Clock3 size={13} />
          {deal.daysLeft} days left
        </span>
      </div>

      <div className="home-deal-content">
        <div className="home-deal-topline">
          <span>{deal.category}</span>

          <span className="home-rating">
            <Star size={13} fill="currentColor" />
            {deal.rating}
          </span>
        </div>

        <h3>{deal.name}</h3>

        <div className="home-deal-prices">
          <strong>{formatPrice(deal.groupPrice)}</strong>
          <del>{formatPrice(deal.originalPrice)}</del>
        </div>

        <div className="home-progress-label">
          <span>
            <Users size={14} />
            {deal.joined} / {deal.required} joined
          </span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div
          className="home-progress-track"
          role="progressbar"
          aria-valuenow={deal.joined}
          aria-valuemin={0}
          aria-valuemax={deal.required}
          aria-label={`${deal.name} buyers joined`}
        >
          <div
            className="home-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Link
          to={`/deals/${deal.id}`}
          className="home-deal-button"
        >
          View Deal
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      {/* HERO SECTION */}

      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="home-hero-badge">
              <ShoppingBag size={15} />
              SMART GROUP SHOPPING
            </div>

            <h1>
              Buy Together.
              <br />
              <span>Save More.</span>
            </h1>

            <p>
              Discover amazing deals, shop with your
              community and unlock unbeatable group
              prices on products you love.
            </p>

            <div className="home-hero-actions">
              <Link
                to="/deals"
                className="home-primary-button"
              >
                Explore Deals
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/how-it-works"
                className="home-secondary-button"
              >
                How It Works
              </Link>
            </div>

            <div className="home-hero-stats">
              <div>
                <strong>2,500+</strong>
                <span>Happy Shoppers</span>
              </div>

              <div>
                <strong>500+</strong>
                <span>Group Deals</span>
              </div>

              <div>
                <strong>30%</strong>
                <span>Average Savings</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1100&q=90"
                alt="Fashion shopping collection"
              />
            </div>

            <div className="home-floating-card home-floating-top">
              <span className="home-floating-icon">
                <Users size={19} />
              </span>

              <div>
                <strong>Shop Together</strong>
                <small>Better prices for everyone</small>
              </div>
            </div>

            <div className="home-floating-card home-floating-bottom">
              <span className="home-floating-icon pink">
                <BadgePercent size={20} />
              </span>

              <div>
                <strong>Save up to 40%</strong>
                <small>With exclusive group deals</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="home-benefits">
        <div className="home-section-container">
          <div className="home-benefits-grid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="home-benefit"
                >
                  <div className="home-benefit-icon">
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRENDING DEALS */}

      <section className="home-trending">
        <div className="home-section-container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">
                DON'T MISS OUT
              </span>

              <h2>
                Trending <span>Group Deals</span>
              </h2>

              <p>
                Join popular deals before time runs out.
              </p>
            </div>

            <Link
              to="/deals"
              className="home-view-all"
            >
              View All Deals
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="home-deals-grid">
            {trendingDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}

      <section className="home-cta-section">
        <div className="home-cta">
          <div>
            <h2>
              Ready to start saving?
            </h2>

            <p>
              Discover the power of buying together
              with BulkBuddy.
            </p>
          </div>

          <Link to="/register">
            Join BulkBuddy
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
