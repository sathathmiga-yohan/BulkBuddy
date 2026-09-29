import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  ShoppingBag,
  Store,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import "./About.css";

const values = [
  {
    icon: Users,
    title: "Community",
    description:
      "Bring buyers together around products they want.",
  },
  {
    icon: BadgePercent,
    title: "Better Value",
    description:
      "Help customers discover attractive group-buying prices.",
  },
  {
    icon: HeartHandshake,
    title: "Collaboration",
    description:
      "Create a marketplace where buyers and sellers benefit from working together.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Use technology to make group buying simple and accessible.",
  },
];

const customerBenefits = [
  "Explore products and group deals",
  "Compare regular and group prices",
  "Join deals with other customers",
  "Track participation and deal status",
];

const sellerBenefits = [
  "Create and manage group deals",
  "Set prices and minimum buyer targets",
  "Monitor deal participation",
  "Import products and view performance reports",
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <span>ABOUT OUR PLATFORM</span>

          <h1>
            Together We Buy.
            <br />
            <strong>Together We Save.</strong>
          </h1>

          <p>
            BulkBuddy is a group-buying marketplace
            project designed to connect customers
            and sellers through shared purchasing
            opportunities.
          </p>

          <Link to="/deals">
            Explore BulkBuddy
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="about-story about-container">
        <div className="about-story-visual">
          <div className="about-visual-main">
            <ShoppingBag size={58} />

            <h3>BulkBuddy</h3>

            <p>
              Buy Together
              <span>•</span>
              Save More
            </p>
          </div>

          <div className="about-visual-badge">
            <Users size={21} />
            Group Buying
          </div>
        </div>

        <div className="about-story-text">
          <span className="about-eyebrow">
            OUR STORY
          </span>

          <h2>
            Making Group Buying
            Simple and Accessible
          </h2>

          <p>
            Buying a product individually may not
            always provide the most attractive price.
            Group buying creates an opportunity for
            multiple customers to purchase the same
            product together.
          </p>

          <p>
            BulkBuddy is being developed to make
            this process easier. Customers can explore
            group deals and follow their progress,
            while sellers can create offers and
            manage participation through one platform.
          </p>

          <Link to="/how-it-works">
            Learn How It Works
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-container">
          <div className="about-heading">
            <span>OUR PURPOSE</span>
            <h2>Our Vision & Mission</h2>
          </div>

          <div className="about-mission-grid">
            <article>
              <div className="about-mission-icon">
                <Target size={28} />
              </div>

              <h3>Our Mission</h3>

              <p>
                To develop an easy-to-use group-buying
                marketplace that connects customers
                and sellers and makes shared purchasing
                more convenient.
              </p>
            </article>

            <article>
              <div className="about-mission-icon pink">
                <TrendingUp size={28} />
              </div>

              <h3>Our Vision</h3>

              <p>
                To create a digital shopping experience
                where communities can come together,
                discover better-value deals and
                support collaborative purchasing.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-values about-container">
        <div className="about-heading">
          <span>WHAT MATTERS TO US</span>
          <h2>Our Core Values</h2>

          <p>
            The ideas guiding the design
            and development of BulkBuddy.
          </p>
        </div>

        <div className="about-values-grid">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article key={value.title}>
                <div className="about-value-icon">
                  <Icon size={25} />
                </div>

                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-audience">
        <div className="about-container">
          <div className="about-heading">
            <span>BUILT FOR EVERYONE</span>
            <h2>One Platform, Two Experiences</h2>

            <p>
              BulkBuddy provides dedicated
              experiences for customers and sellers.
            </p>
          </div>

          <div className="about-audience-grid">
            <article>
              <div className="about-audience-icon">
                <ShoppingBag size={29} />
              </div>

              <h3>For Customers</h3>

              <p>
                Discover products and join
                group-buying opportunities.
              </p>

              <ul>
                {customerBenefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle2 size={17} />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link to="/deals">
                Browse Deals
                <ArrowRight size={17} />
              </Link>
            </article>

            <article>
              <div className="about-audience-icon seller">
                <Store size={29} />
              </div>

              <h3>For Sellers</h3>

              <p>
                Create group deals and manage
                products from a seller dashboard.
              </p>

              <ul>
                {sellerBenefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle2 size={17} />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link to="/register">
                Join as a Seller
                <ArrowRight size={17} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-container">
          <h2>Be Part of BulkBuddy</h2>

          <p>
            Explore group deals and experience
            the idea of shopping together.
          </p>

          <div>
            <Link to="/register">
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/how-it-works"
              className="about-cta-secondary"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}