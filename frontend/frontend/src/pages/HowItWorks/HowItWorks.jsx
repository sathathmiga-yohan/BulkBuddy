import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Explore Group Deals",
    description:
      "Browse products, compare original and group prices, and find deals you love.",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Join a Group",
    description:
      "Choose your quantity and join other buyers interested in the same product.",
  },
  {
    number: "03",
    icon: Users,
    title: "Reach the Target",
    description:
      "Each deal has a minimum number of buyers. Track its progress before the deadline.",
  },
  {
    number: "04",
    icon: PackageCheck,
    title: "Complete Your Purchase",
    description:
      "When the group succeeds, the order can move forward to payment and delivery.",
  },
];

const benefits = [
  {
    icon: ShoppingBag,
    title: "Better Group Prices",
    description:
      "Buy together with other customers to unlock special group offers.",
  },
  {
    icon: Clock3,
    title: "Track Deal Progress",
    description:
      "See how many people have joined and how much time remains.",
  },
  {
    icon: ShieldCheck,
    title: "Clear Deal Information",
    description:
      "View prices, buyer targets, deadlines and product details before joining.",
  },
];

const faqs = [
  {
    question: "What is group buying?",
    answer:
      "Group buying allows several customers to join the same product deal. The deal succeeds when the required number of buyers is reached.",
  },
  {
    question: "What happens if the group reaches its target?",
    answer:
      "The deal becomes successful. Payment confirmation, order processing and delivery will be handled when the backend workflow is connected.",
  },
  {
    question: "What if the deal does not reach its target?",
    answer:
      "The deal is marked as failed when its deadline passes without enough buyers. Payment and refund rules will be confirmed during backend integration.",
  },
  {
    question: "Can I track the deals I joined?",
    answer:
      "Yes. The My Deals page is designed to show active, successful and failed deals.",
  },
];

export default function HowItWorks() {
  return (
    <main className="hiw-page">
      <section className="hiw-hero">
        <div className="hiw-container hiw-hero-content">
          <span className="hiw-eyebrow">
            SIMPLE GROUP BUYING
          </span>

          <h1>
            How <span>BulkBuddy</span> Works
          </h1>

          <p>
            Shopping is better together. Discover how
            BulkBuddy connects buyers to unlock group
            deals in four simple steps.
          </p>

          <div className="hiw-hero-actions">
            <Link to="/deals" className="hiw-primary">
              Explore Deals
              <ArrowRight size={18} />
            </Link>

            <Link to="/register" className="hiw-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-container">
        <div className="hiw-section-heading">
          <span>THE PROCESS</span>
          <h2>Four Steps to Smarter Shopping</h2>
          <p>
            From discovering a product to completing
            your group purchase.
          </p>
        </div>

        <div className="hiw-steps">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                className="hiw-step-card"
                key={step.number}
              >
                <div className="hiw-step-top">
                  <div className="hiw-step-icon">
                    <Icon size={25} />
                  </div>

                  <span>{step.number}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hiw-example-section">
        <div className="hiw-container hiw-example-grid">
          <div>
            <span className="hiw-eyebrow">
              UNDERSTAND THE CONCEPT
            </span>

            <h2>
              More Buyers.
              <br />
              Better Deals.
            </h2>

            <p>
              Imagine a laptop with a regular price of
              Rs. 120,000. A seller creates a group deal
              offering it for Rs. 84,000 when at least
              20 buyers join.
            </p>

            <p>
              As customers join, the progress increases.
              When the required target is reached before
              the deadline, the deal succeeds.
            </p>

            <Link to="/deals">
              Find Your Next Deal
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hiw-example-card">
            <span className="hiw-example-badge">
              EXAMPLE DEAL
            </span>

            <h3>Dell Inspiron Laptop</h3>

            <div className="hiw-example-prices">
              <div>
                <small>Regular Price</small>
                <del>Rs. 120,000</del>
              </div>

              <div>
                <small>Group Price</small>
                <strong>Rs. 84,000</strong>
              </div>
            </div>

            <div className="hiw-example-saving">
              Save Rs. 36,000
            </div>

            <div className="hiw-example-progress-label">
              <span>
                <Users size={16} />
                15 of 20 buyers joined
              </span>

              <strong>75%</strong>
            </div>

            <div className="hiw-progress">
              <span />
            </div>

            <p>
              Only 5 more buyers needed!
            </p>
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-container">
        <div className="hiw-section-heading">
          <span>WHY BULKBUDDY?</span>
          <h2>Shopping Together Has Benefits</h2>
          <p>
            Everything you need to discover and
            follow group-buying opportunities.
          </p>
        </div>

        <div className="hiw-benefits">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article key={benefit.title}>
                <div className="hiw-benefit-icon">
                  <Icon size={25} />
                </div>

                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hiw-outcomes">
        <div className="hiw-container">
          <div className="hiw-section-heading">
            <span>DEAL OUTCOMES</span>
            <h2>What Happens Next?</h2>
          </div>

          <div className="hiw-outcome-grid">
            <article className="hiw-outcome-success">
              <CheckCircle2 size={29} />

              <h3>Successful Deal</h3>

              <p>
                The minimum number of buyers joins
                before the deadline.
              </p>

              <div>
                <BadgeCheck size={17} />
                Target achieved
              </div>

              <div>
                <CreditCard size={17} />
                Payment workflow
              </div>

              <div>
                <Truck size={17} />
                Order and delivery workflow
              </div>
            </article>

            <article className="hiw-outcome-failed">
              <XCircle size={29} />

              <h3>Failed Deal</h3>

              <p>
                The deadline passes before the minimum
                buyer target is reached.
              </p>

              <div>
                <Clock3 size={17} />
                Deal deadline reached
              </div>

              <div>
                <XCircle size={17} />
                Group target not achieved
              </div>

              <div>
                <Search size={17} />
                Explore another group deal
              </div>
            </article>
          </div>

          <p className="hiw-demo-note">
            Payment, refunds and delivery are planned
            workflows. Their final rules will be
            confirmed during backend integration.
          </p>
        </div>
      </section>

      <section className="hiw-section hiw-container">
        <div className="hiw-section-heading">
          <span>COMMON QUESTIONS</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="hiw-faq">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <span>+</span>
              </summary>

              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hiw-cta">
        <div className="hiw-container">
          <h2>Ready to Shop Together?</h2>

          <p>
            Discover group deals and start your
            BulkBuddy journey today.
          </p>

          <Link to="/deals">
            Browse Deals
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}