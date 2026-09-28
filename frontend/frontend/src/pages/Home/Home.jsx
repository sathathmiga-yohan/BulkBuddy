import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DealCard from "../../components/DealCard/DealCard";
import { getDeals } from "../../services/dealservice";
import homeHero from "../../assets/images/1.png";

import "./Home.css";

function Home() {
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ACTIVE DEALS
  // ==========================================
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDeals();

        const deals = Array.isArray(data) ? data : [];

        // Show only first 3 deals on Home page
        const featured = deals
          .slice(0, 3)
          .map((deal) => ({
            id: deal.id,

            productName: deal.product_name,

            description: deal.description,

            normalPrice: Number(
              deal.normal_price ?? 0
            ),

            groupPrice: Number(
              deal.group_price ?? 0
            ),

            minimumBuyers: Number(
              deal.minimum_buyers ?? 0
            ),

            currentBuyers: Number(
              deal.current_participants ?? 0
            ),

            deadline: deal.deadline,

            status: deal.status,

            icon: "🛍️",
          }));

        setFeaturedDeals(featured);
      } catch (error) {
        console.error(
          "Home deals error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load deals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  return (
    <main className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <div className="container hero-container">

          {/* HERO CONTENT */}
          <div className="hero-content">

            <span className="hero-label">
              Smart Group Buying
            </span>

            <h1>
              Buy Together.
              <span> Save More.</span>
            </h1>

            <p>
              Join other shoppers, reach the
              group target and unlock better
              prices on products you love.
            </p>

            <div className="hero-buttons">

              <Link
                to="/deals"
                className="hero-primary-button"
              >
                Browse Deals
              </Link>

              <Link
                to="/register"
                className="hero-secondary-button"
              >
                Get Started
              </Link>

            </div>

          </div>

          {/* HERO IMAGE */}
          <div className="hero-image">
            <img
              src={homeHero}
              alt="BulkBuddy group buying"
            />
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="container">

          <div className="section-heading">

            <span>
              Simple & Easy
            </span>

            <h2>
              How BulkBuddy Works
            </h2>

            <p>
              Save more in three simple steps.
            </p>

          </div>

          <div className="steps-grid">

            <div className="step-card">

              <div className="step-icon">
                🔎
              </div>

              <h3>
                Find a Deal
              </h3>

              <p>
                Browse available group deals
                and choose a product you want.
              </p>

            </div>

            <div className="step-card">

              <div className="step-icon">
                👥
              </div>

              <h3>
                Join the Group
              </h3>

              <p>
                Join other buyers before the
                deal deadline and help reach
                the target.
              </p>

            </div>

            <div className="step-card">

              <div className="step-icon">
                💰
              </div>

              <h3>
                Save More
              </h3>

              <p>
                When the group target is
                reached, everyone gets the
                better group price.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* FEATURED DEALS */}
      <section className="featured-deals">
        <div className="container">

          <div className="featured-header">

            <div>

              <span className="featured-label">
                Group Savings
              </span>

              <h2>
                Active Deals
              </h2>

              <p>
                Join a group before the
                deadline and unlock the
                deal price.
              </p>

            </div>

            <Link
              to="/deals"
              className="all-deals-link"
            >
              View All Deals →
            </Link>

          </div>

          {/* LOADING */}
          {loading && (
            <p>
              Loading deals...
            </p>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="home-deals-error">
              {error}
            </div>
          )}

          {/* DEALS */}
          {!loading &&
            !error &&
            featuredDeals.length > 0 && (

              <div className="deals-grid">

                {featuredDeals.map(
                  (deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                    />
                  )
                )}

              </div>
            )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            featuredDeals.length === 0 && (

              <p>
                No active deals available
                right now.
              </p>
            )}

        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="container">

          <div className="cta-content">

            <h2>
              Ready to start saving together?
            </h2>

            <p>
              Create your BulkBuddy account
              and join your first group deal
              today.
            </p>

            <Link
              to="/register"
              className="cta-button"
            >
              Join BulkBuddy
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Home;