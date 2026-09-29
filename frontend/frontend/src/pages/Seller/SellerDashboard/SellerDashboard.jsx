
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Clock3,
  FileSpreadsheet, Package, Plus,
  Search, TrendingUp, Users
} from "lucide-react";
import SellerLayout from "./SellerLayout.jsx";
import { sellerDeals, sellerStats } from "../sellerMockData.js";
import { formatPrice } from "../../../data/mockDeals.js";
import "./SellerDashboard.css";

export default function SellerDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return sellerDeals.filter(deal => {
      const matchesSearch =
        `${deal.name} ${deal.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesSearch &&
        (status === "all" || deal.status === status);
    });
  }, [search, status]);

  const cards = [
    { label: "Total Deals", value: sellerStats.total, icon: Package },
    { label: "Active Deals", value: sellerStats.active, icon: Clock3 },
    { label: "Successful Deals", value: sellerStats.successful, icon: CheckCircle2 },
    { label: "Total Participants", value: sellerStats.participants, icon: Users }
  ];

  return (
    <SellerLayout title="Dashboard Overview">
      <section className="sd-welcome">
        <div>
          <small>SELLER WORKSPACE</small>
          <h2>Welcome back, Demo Seller!</h2>
          <p>Manage your group deals and track marketplace activity.</p>
        </div>
        <Link className="sd-primary" to="/seller/create-deal">
          <Plus size={18} /> Create New Deal
        </Link>
      </section>

      <section className="sd-stats">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <article className="sd-stat" key={card.label}>
              <div className="sd-stat-icon">
                <Icon size={22} />
              </div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="sd-panel">
        <div className="sd-panel-heading">
          <div>
            <h2>Recent Deals</h2>
            <p>Track your recently created group deals.</p>
          </div>
          <Link to="/seller/deals">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>

        <div className="sd-toolbar">
          <label className="sd-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search deals..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
            aria-label="Filter deal status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="sd-table-wrap">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Group Price</th>
                <th>Participants</th>
                <th>Status</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(deal => (
                <tr key={deal.id}>
                  <td>
                    <strong>{deal.name}</strong>
                    <small>{deal.category}</small>
                  </td>
                  <td className="sd-price">
                    {formatPrice(deal.groupPrice)}
                  </td>
                  <td>
                    <span>{deal.participants}/{deal.required}</span>
                    <div className="sd-progress">
                      <span
                        style={{
                          width: `${Math.min(
                            deal.participants / deal.required * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`sd-status ${deal.status}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td>{deal.endDate}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="sd-empty">
                    No matching deals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sd-table-footer">
          Showing {filtered.length} of {sellerDeals.length} demo deals
        </div>
      </section>

      <section className="sd-quick">
        <h2>Quick Actions</h2>
        <div className="sd-quick-grid">
          {[
            {
              title: "Create Deal",
              detail: "Add a new group buying offer.",
              icon: Plus,
              path: "/seller/create-deal"
            },
            {
              title: "Import CSV",
              detail: "Upload multiple deals.",
              icon: FileSpreadsheet,
              path: "/seller/import"
            },
            {
              title: "View Reports",
              detail: "Explore deal performance.",
              icon: TrendingUp,
              path: "/seller/reports"
            }
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
      </section>
    </SellerLayout>
  );
}
