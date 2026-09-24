import { Link } from "react-router-dom";
import DealCard from "../../components/DealCard/DealCard";
import "./Home.css";

function Home() {
  // Temporary frontend data.
  // Backend connect pannumbothu GET /deals response use pannuvom.
  const featuredDeals = [
    {
      id: 1,
      productName: "Smart Watch",
      description: "Special group buying offer for a smart watch.",
      normalPrice: 8500,
      groupPrice: 6500,
      minimumBuyers: 5,
      currentBuyers: 3,
      deadline: "2 days left",
      icon: "⌚",
    },
    {
      id: 2,
      productName: "Wireless Headphones",
      description: "Join the group and save on wireless headphones.",
      normalPrice: 12000,
      groupPrice: 9000,
      minimumBuyers: 6,
      currentBuyers: 4,
      deadline: "3 days left",
      icon: "🎧",
    },
    {
      id: 3,
      productName: "Laptop Bag",
      description: "A practical laptop bag at a better group price.",
      normalPrice: 5000,
      groupPrice: 4000,
      minimumBuyers: 4,
      currentBuyers: 3,
      deadline: "4 days left",
      icon: "💼",
    },
  ];

  return (
    <main className="home-page">

      {/* HERO */}

      <section className="home-hero">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-label">
              Smart Group Buying
            </span>

            <h1>
              Buy Together.
              <span> Save More.</span>
            </h1>

            <p>
              Join other shoppers, reach the group target
              and unlock better prices on products you love.
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
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="how-it-works">
        <div className="container">
          <div className="section-heading">
            <span>Simple & Easy</span>
            <h2>How BulkBuddy Works</h2>
            <p>
              Save more in three simple steps.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">🔎</div>
              <h3>Find a Deal</h3>
              <p>
                Browse available group deals and choose
                a product you want.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">👥</div>
              <h3>Join the Group</h3>
              <p>
                Join other buyers before the deal deadline
                and help reach the target.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">💰</div>
              <h3>Save More</h3>
              <p>
                When the group target is reached, everyone
                gets the better group price.
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

              <h2>Active Deals</h2>

              <p>
                Join a group before the deadline and
                unlock the deal price.
              </p>
            </div>

            <Link
              to="/deals"
              className="all-deals-link"
            >
              View All Deals →
            </Link>
          </div>

          <div className="deals-grid">
            {featuredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
              />
            ))}
          </div>
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
              Create your BulkBuddy account and join
              your first group deal today.
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