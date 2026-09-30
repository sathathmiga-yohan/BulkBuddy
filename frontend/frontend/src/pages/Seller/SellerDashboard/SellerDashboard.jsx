
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Package,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import SellerLayout from "./SellerLayout.jsx";

import {
  getSellerDeals,
  getSellerDealParticipants,
} from "../../../services/dealservice.js"; import { getCurrentUser } from "../../../services/authservice.js";

import { formatPrice } from "../../../data/mockDeals.js";

import "./SellerDashboard.css";

export default function SellerDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [sellerDeals, setSellerDeals] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const [sellerName, setSellerName] = useState("Seller");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD SELLER DETAILS AND OWN DEALS FROM BACKEND
  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [user, deals] = await Promise.all([
          getCurrentUser(),
          getSellerDeals(),
        ]);

        const ownDeals = Array.isArray(deals) ? deals : [];

        const results = await Promise.allSettled(
          ownDeals.map(async (deal) => {
            const response = await getSellerDealParticipants(deal.id);

            const joinedCount = (response.participants || []).filter(
              (participant) =>
                String(participant.status).toUpperCase() === "JOINED"
            ).length;

            return {
              dealId: deal.id,
              count: joinedCount,
            };
          })
        );

        const countsByDeal = {};

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            countsByDeal[result.value.dealId] = result.value.count;
          }
        });

        if (!cancelled) {
          setSellerName(user.name || "Seller");
          setSellerDeals(ownDeals);
          setParticipantCounts(countsByDeal);
        }
      } catch (err) {
        console.error("Seller dashboard error:", err);

        if (!cancelled) {
          const detail = err?.response?.data?.detail;

          setError(
            typeof detail === "string"
              ? detail
              : "Unable to load seller dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // SEARCH AND STATUS FILTER
  const filtered = useMemo(() => {
    return sellerDeals.filter((deal) => {
      const matchesSearch = (
        `${deal.product_name} ${deal.description || ""}`
      )
        .toLowerCase()
        .includes(search.toLowerCase());

      const dealStatus = String(
        deal.status || ""
      ).toLowerCase();

      return (
        matchesSearch &&
        (status === "all" || dealStatus === status)
      );
    });
  }, [sellerDeals, search, status]);

  // ACTUAL DEAL STATISTICS
  const totalDeals = sellerDeals.length;

  const activeDeals = sellerDeals.filter(
    (deal) =>
      String(deal.status).toUpperCase() === "ACTIVE"
  ).length;

  const successfulDeals = sellerDeals.filter(
    (deal) =>
      String(deal.status).toUpperCase() === "SUCCESSFUL"
  ).length;

  const totalParticipants = sellerDeals.every(
    (deal) => participantCounts[deal.id] !== undefined
  )
    ? sellerDeals.reduce(
      (sum, deal) => sum + participantCounts[deal.id],
      0
    )
    : "—";

  const cards = [
    {
      label: "Total Deals",
      value: totalDeals,
      icon: Package,
    },
    {
      label: "Active Deals",
      value: activeDeals,
      icon: Clock3,
    },
    {
      label: "Successful Deals",
      value: successfulDeals,
      icon: CheckCircle2,
    },
    {
      label: "Total Participants",
      value: totalParticipants,
      icon: Users,
    },
  ];

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString();
  };

  return (
    <SellerLayout title="Dashboard Overview">
      {/* WELCOME */}
      <section className="sd-welcome">
        <div>
          <small>SELLER WORKSPACE</small>

          <h2>Welcome back, {sellerName}!</h2>

          <p>
            Manage your group deals and track marketplace
            activity.
          </p>
        </div>

        <Link
          className="sd-primary"
          to="/seller/create-deal"
        >
          <Plus size={18} />
          Create New Deal
        </Link>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <section className="sd-panel" role="alert">
          <p>{error}</p>
        </section>
      )}

      {/* STATISTICS */}
      <section className="sd-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="sd-stat"
              key={card.label}
            >
              <div className="sd-stat-icon">
                <Icon size={22} />
              </div>

              <span>{card.label}</span>

              <strong>
                {loading ? "..." : card.value}
              </strong>
            </article>
          );
        })}
      </section>

      {/* RECENT DEALS */}
      <section className="sd-panel">
        <div className="sd-panel-heading">
          <div>
            <h2>Recent Deals</h2>

            <p>
              Track your recently created group deals.
            </p>
          </div>

          <Link to="/seller/deals">
            View All Deals
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="sd-toolbar">
          <label className="sd-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search deals..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            aria-label="Filter deal status"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="successful">
              Successful
            </option>

            <option value="failed">
              Failed
            </option>
          </select>
        </div>

        {/* DEALS TABLE */}
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
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="sd-empty"
                  >
                    Loading seller deals...
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((deal) => {
                    const dealStatus = String(
                      deal.status || ""
                    ).toLowerCase();

                    return (
                      <tr key={deal.id}>
                        <td>
                          <strong>
                            {deal.product_name}
                          </strong>

                          <small>
                            Deal #{deal.id}
                          </small>
                        </td>

                        <td className="sd-price">
                          {formatPrice(
                            Number(deal.group_price)
                          )}
                        </td>

                        <td>
                          <span>
                            {participantCounts[deal.id] ?? "—"} / {deal.minimum_buyers}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`sd-status ${dealStatus}`}
                          >
                            {dealStatus}
                          </span>
                        </td>

                        <td>
                          {formatDate(deal.deadline)}
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="sd-empty"
                      >
                        No matching deals found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="sd-table-footer">
          Showing {filtered.length} of{" "}
          {sellerDeals.length} deals
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="sd-quick">
        <h2>Quick Actions</h2>

        <div className="sd-quick-grid">
          {[
            {
              title: "Create Deal",
              detail: "Add a new group buying offer.",
              icon: Plus,
              path: "/seller/create-deal",
            },
            {
              title: "Import CSV",
              detail: "Upload multiple deals.",
              icon: FileSpreadsheet,
              path: "/seller/import",
            },
            {
              title: "View Reports",
              detail: "Explore deal performance.",
              icon: TrendingUp,
              path: "/seller/reports",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
              >
                <Icon size={24} />

                <strong>
                  {item.title}
                </strong>

                <span>
                  {item.detail}
                </span>

                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
      </section>
    </SellerLayout>
  );
}
