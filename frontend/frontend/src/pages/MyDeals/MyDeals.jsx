
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Clock3, Heart,
  LogOut, Package, Settings, ShoppingBag,
  UserRound, Users, XCircle
} from "lucide-react";
import { mockDeals, formatPrice } from "../../data/mockDeals.js";
import "./MyDeals.css";

const joinedDeals = [
  { dealId: 1, status: "active", quantity: 1, date: "2026-09-25" },
  { dealId: 2, status: "active", quantity: 1, date: "2026-09-24" },
  { dealId: 4, status: "successful", quantity: 2, date: "2026-09-15" },
  { dealId: 6, status: "failed", quantity: 1, date: "2026-09-10" }
];

const filters = ["all", "active", "successful", "failed"];

export default function MyDeals() {
  const [page, setPage] = useState("deals");
  const [filter, setFilter] = useState("all");
  const [profile, setProfile] = useState({
    name: "Demo Customer",
    email: "customer@example.com",
    phone: ""
  });
  const [saved, setSaved] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [dealUpdates, setDealUpdates] = useState(true);

  const visibleDeals = joinedDeals.filter(
    item => filter === "all" || item.status === filter
  );

  const counts = {
    all: joinedDeals.length,
    active: joinedDeals.filter(d => d.status === "active").length,
    successful: joinedDeals.filter(d => d.status === "successful").length,
    failed: joinedDeals.filter(d => d.status === "failed").length
  };

  const updateProfile = event => {
    setProfile(current => ({
      ...current,
      [event.target.name]: event.target.value
    }));
    setSaved(false);
  };

  return (
    <main className="mydeals-page">
      <div className="mydeals-layout">
        <aside className="mydeals-sidebar">
          <div className="mydeals-user">
            <div className="mydeals-avatar">
              <UserRound size={27} />
            </div>
            <strong>{profile.name}</strong>
            <span>Customer Account</span>
          </div>

          <nav className="mydeals-navigation">
            <button
              className={page === "deals" ? "active" : ""}
              onClick={() => setPage("deals")}
            >
              <Package size={18} /> My Deals
            </button>
            <button
              className={page === "profile" ? "active" : ""}
              onClick={() => setPage("profile")}
            >
              <UserRound size={18} /> My Profile
            </button>
            <button
              className={page === "settings" ? "active" : ""}
              onClick={() => setPage("settings")}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>

          <div className="mydeals-sidebar-bottom">
            <Link to="/deals">
              <ShoppingBag size={18} /> Explore Deals
            </Link>
            <Link to="/login">
              <LogOut size={18} /> Logout (Demo)
            </Link>
          </div>
        </aside>

        <section className="mydeals-main">
          {page === "deals" && (
            <>
              <header className="mydeals-header">
                <div>
                  <small>CUSTOMER DASHBOARD</small>
                  <h1>My Deals</h1>
                  <p>Track all your group purchases.</p>
                </div>
                <Link className="mydeals-primary" to="/deals">
                  Explore Deals <ArrowRight size={17} />
                </Link>
              </header>

              <div className="mydeals-stats">
                {[
                  { key: "all", title: "Total Joined", icon: ShoppingBag },
                  { key: "active", title: "Active Deals", icon: Clock3 },
                  { key: "successful", title: "Successful", icon: CheckCircle2 },
                  { key: "failed", title: "Failed Deals", icon: XCircle }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div className="mydeals-stat" key={item.key}>
                      <div className={`mydeals-stat-icon ${item.key}`}>
                        <Icon size={22} />
                      </div>
                      <span>{item.title}</span>
                      <strong>{counts[item.key]}</strong>
                    </div>
                  );
                })}
              </div>

              <section className="mydeals-panel">
                <div className="mydeals-panel-title">
                  <h2>Joined Group Deals</h2>
                  <span>{visibleDeals.length} deals</span>
                </div>

                <div className="mydeals-filters">
                  {filters.map(value => (
                    <button
                      key={value}
                      className={filter === value ? "active" : ""}
                      onClick={() => setFilter(value)}
                    >
                      {value === "all"
                        ? "All Deals"
                        : value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="mydeals-list">
                  {visibleDeals.map(item => {
                    const deal = mockDeals.find(d => d.id === item.dealId);
                    if (!deal) return null;

                    const progress = Math.min(
                      100,
                      Math.round(deal.joined / deal.required * 100)
                    );

                    return (
                      <article className="mydeals-card" key={item.dealId}>
                        <img src={deal.image} alt={deal.name} />
                        <div className="mydeals-card-body">
                          <div className="mydeals-card-top">
                            <span>{deal.category}</span>
                            <span className={`mydeals-status ${item.status}`}>
                              {item.status}
                            </span>
                          </div>

                          <h3>{deal.name}</h3>
                          <p>Joined: {item.date}</p>

                          <div className="mydeals-prices">
                            <div>
                              <small>Group Price</small>
                              <strong>{formatPrice(deal.groupPrice)}</strong>
                            </div>
                            <div>
                              <small>Quantity</small>
                              <strong>{item.quantity}</strong>
                            </div>
                            <div>
                              <small>Your Total</small>
                              <strong>
                                {formatPrice(deal.groupPrice * item.quantity)}
                              </strong>
                            </div>
                          </div>

                          <div className="mydeals-progress-label">
                            <span>
                              <Users size={14} />
                              {deal.joined}/{deal.required} buyers
                            </span>
                            <strong>{progress}%</strong>
                          </div>

                          <div className="mydeals-progress">
                            <span style={{ width: `${progress}%` }} />
                          </div>

                          <div className="mydeals-card-footer">
                            <span>
                              {item.status === "active"
                                ? `${deal.daysLeft} days left`
                                : item.status === "successful"
                                  ? "Group target achieved"
                                  : "Group target not achieved"}
                            </span>
                            <Link to={`/deals/${deal.id}`}>
                              View Details <ArrowRight size={15} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {visibleDeals.length === 0 && (
                    <div className="mydeals-empty">
                      <Package size={35} />
                      <h3>No deals found</h3>
                      <p>No deals available for this filter.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {page === "profile" && (
            <>
              <header className="mydeals-header">
                <div>
                  <small>CUSTOMER DASHBOARD</small>
                  <h1>My Profile</h1>
                  <p>Update your personal details.</p>
                </div>
              </header>

              <section className="mydeals-panel mydeals-form-panel">
                <h2>Personal Information</h2>
                <p>Changes are saved in this demo page only.</p>

                <form onSubmit={event => {
                  event.preventDefault();
                  setSaved(true);
                }}>
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "email", label: "Email", type: "email" },
                    { name: "phone", label: "Phone Number", type: "tel" }
                  ].map(field => (
                    <label key={field.name}>
                      {field.label}
                      <input
                        name={field.name}
                        type={field.type}
                        value={profile[field.name]}
                        onChange={updateProfile}
                        required={field.name !== "phone"}
                      />
                    </label>
                  ))}

                  <button className="mydeals-primary" type="submit">
                    Save Changes
                  </button>
                  {saved && (
                    <p className="mydeals-saved">
                      <CheckCircle2 size={17} />
                      Profile updated in this demo.
                    </p>
                  )}
                </form>
              </section>
            </>
          )}

          {page === "settings" && (
            <>
              <header className="mydeals-header">
                <div>
                  <small>CUSTOMER DASHBOARD</small>
                  <h1>Settings</h1>
                  <p>Manage your demo notification preferences.</p>
                </div>
              </header>

              <section className="mydeals-panel mydeals-form-panel">
                <h2>Notification Preferences</h2>
                <p>Actual notifications require backend integration.</p>

                <label className="mydeals-setting">
                  <span>
                    <strong>Email Notifications</strong>
                    <small>Receive email updates.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={event => setEmailUpdates(event.target.checked)}
                  />
                </label>

                <label className="mydeals-setting">
                  <span>
                    <strong>Deal Notifications</strong>
                    <small>Receive updates about joined deals.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={dealUpdates}
                    onChange={event => setDealUpdates(event.target.checked)}
                  />
                </label>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
