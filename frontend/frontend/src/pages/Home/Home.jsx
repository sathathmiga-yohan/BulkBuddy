
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Users,
  ShieldCheck,
  BadgePercent,
  Clock3,
  ShoppingBag,
  Package,
  Info,
} from "lucide-react";

import { getDeals } from "../../services/dealservice";

import "./Home.css";


// ==========================================
// DEFAULT PRODUCT IMAGE
// ==========================================

const DEFAULT_IMAGE =
  "https://placehold.co/600x400?text=BulkBuddy";


// ==========================================
// HOME BENEFITS
// ==========================================

const benefits = [
  {
    icon: Users,
    title: "Group Buying",
    description:
      "Join other shoppers and unlock better prices together.",
  },
  {
    icon: BadgePercent,
    title: "Big Savings",
    description:
      "Enjoy group prices on available deals.",
  },
  {
    icon: ShieldCheck,
    title: "Seller Accounts",
    description:
      "Browse group deals created by registered sellers.",
  },
  {
    icon: Package,
    title: "Track Your Deals",
    description:
      "Check your joined deals and their progress from your dashboard.",
  },
];


// ==========================================
// FORMAT PRICE
// ==========================================

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);


// ==========================================
// CONVERT BACKEND DEAL DATA
// ==========================================

function mapBackendDeal(deal) {
  const originalPrice = Number(deal.normal_price);
  const groupPrice = Number(deal.group_price);

  const deadline = new Date(deal.deadline);

  const remaining =
    deadline.getTime() - Date.now();

  return {
    id: deal.id,

    name: deal.product_name,

    image: DEFAULT_IMAGE,

    originalPrice,

    groupPrice,

    joined: Number(deal.participant_count ?? 0),

    required: Number(deal.minimum_buyers),

    daysLeft: Number.isFinite(remaining)
      ? Math.max(
          0,
          Math.ceil(remaining / 86400000)
        )
      : 0,

    discount:
      originalPrice > 0
        ? Math.round(
            ((originalPrice - groupPrice) /
              originalPrice) *
              100
          )
        : 0,
  };
}


// ==========================================
// HOME DEAL CARD
// ==========================================

function DealCard({ deal }) {
  const progress =
    deal.required > 0
      ? Math.min(
          Math.round(
            (deal.joined / deal.required) * 100
          ),
          100
        )
      : 0;

  return (
    <article className="home-deal-card">

      <div className="home-deal-image-wrap">

        <img
          src={deal.image}
          alt={`${deal.name} placeholder`}
          loading="lazy"
        />

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
          <span>Group Deal</span>
        </div>

        <h3>{deal.name}</h3>

        <div className="home-deal-prices">

          <strong>
            {formatPrice(deal.groupPrice)}
          </strong>

          <del>
            {formatPrice(deal.originalPrice)}
          </del>

        </div>

        <div className="home-progress-label">

          <span>
            <Users size={14} />
            {deal.joined} / {deal.required} joined
          </span>

          <span>{progress}%</span>

        </div>

        <div
          className="home-progress-track"
          role="progressbar"
          aria-valuenow={Math.min(
            deal.joined,
            deal.required
          )}
          aria-valuemin={0}
          aria-valuemax={deal.required}
          aria-label={`${deal.name} buyers joined`}
        >

          <div
            className="home-progress-fill"
            style={{
              width: `${progress}%`,
            }}
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


// ==========================================
// HOME PAGE
// ==========================================

export default function Home() {

  const [trendingDeals, setTrendingDeals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");


  // ========================================
  // LOAD REAL DEALS FROM BACKEND
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadDeals() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getDeals();

        const activeDeals = data
          .filter(
            (deal) =>
              deal.status === "ACTIVE" &&
              new Date(deal.deadline).getTime() >
                Date.now()
          )
          .slice(0, 4)
          .map(mapBackendDeal);

        if (!cancelled) {
          setTrendingDeals(activeDeals);
        }

      } catch (error) {

        console.error(
          "Unable to load home deals:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load deals right now. Please try again later."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    }

    loadDeals();

    return () => {
      cancelled = true;
    };

  }, []);


  return (
    <main>

      {/* =====================================
          HERO SECTION
      ===================================== */}

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
              Discover group deals, shop with your
              community and unlock better prices
              on products you love.
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

          </div>


          {/* HERO IMAGE */}

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
                <small>
                  Better prices for everyone
                </small>
              </div>

            </div>

            <div className="home-floating-card home-floating-bottom">

              <span className="home-floating-icon pink">
                <BadgePercent size={20} />
              </span>

              <div>
                <strong>Group Discounts</strong>
                <small>
                  Join a deal to save
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          BENEFITS SECTION
      ===================================== */}

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

                    <Icon
                      size={24}
                      strokeWidth={2}
                    />

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


      {/* =====================================
          LATEST GROUP DEALS
      ===================================== */}

      <section className="home-trending">

        <div className="home-section-container">

          <div className="home-section-heading">

            <div>

              <span className="home-section-eyebrow">
                DON'T MISS OUT
              </span>

              <h2>
                Latest <span>Group Deals</span>
              </h2>

              <p>
                Explore available deals before
                their deadlines.
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


          {/* DEALS LOADING / ERROR / EMPTY */}

          {loading ? (

            <p role="status">
              Loading deals...
            </p>

          ) : loadError ? (

            <p role="alert">

              <Info
                size={16}
                style={{
                  verticalAlign: "middle",
                }}
              />

              {" "}
              {loadError}

            </p>

          ) : trendingDeals.length === 0 ? (

            <p>
              No active deals available yet.
              Check back soon.
            </p>

          ) : (

            <div className="home-deals-grid">

              {trendingDeals.map((deal) => (

                <DealCard
                  key={deal.id}
                  deal={deal}
                />

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================
          BOTTOM CTA SECTION
      ===================================== */}

      <section className="home-cta-section">

        <div className="home-cta">

          <div>

            <h2>
              Ready to start saving?
            </h2>

            <p>
              Discover the power of buying
              together with BulkBuddy.
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
