
import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";

import { formatPrice } from "../../../data/mockDeals.js";

import { getSellerReport } from "../../../services/reportservice.js";

import {
  getSellerDeals,
  getSellerDealParticipants,
} from "../../../services/dealservice.js";

import "./Reports.css";

// ==========================================
// HELPERS
// ==========================================

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-CA");
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "Unable to load seller reports. Please try again.";
}

function downloadCSV(rows, filename) {
  const headers = [
    "Deal ID",
    "Deal Name",
    "Group Price (LKR)",
    "Joined Buyers",
    "Waiting Buyers",
    "Minimum Buyers",
    "Maximum Quantity",
    "Status",
    "Deadline",
  ];

  const values = rows.map((deal) => [
    deal.id,
    deal.product_name,
    deal.group_price,
    deal.joined_count,
    deal.waiting_count,
    deal.minimum_buyers,
    deal.maximum_quantity,
    deal.status,
    deal.deadline,
  ]);

  const escapeCell = (value) => {
    const safeValue = String(value ?? "").replace(
      /^[\s]*([=+\-@])/,
      "'$1"
    );

    return `"${safeValue.replace(/"/g, '""')}"`;
  };

  const csv = [headers, ...values]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// ==========================================
// REPORTS COMPONENT
// ==========================================

export default function Reports() {
  const [deals, setDeals] = useState([]);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ==========================================
  // LOAD BACKEND REPORTS
  // ==========================================

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [reportData, sellerDealsData] =
          await Promise.all([
            getSellerReport(),
            getSellerDeals(),
          ]);

        const sellerDeals = Array.isArray(sellerDealsData)
          ? sellerDealsData
          : [];

        // Load actual participants for each seller deal.
        const dealsWithCounts = await Promise.all(
          sellerDeals.map(async (deal) => {
            const participationData =
              await getSellerDealParticipants(deal.id);

            const participants = Array.isArray(
              participationData?.participants
            )
              ? participationData.participants
              : [];

            const joinedCount = participants.filter(
              (participant) =>
                participant.status === "JOINED"
            ).length;

            const waitingCount = participants.filter(
              (participant) =>
                participant.status === "WAITING"
            ).length;

            return {
              ...deal,
              joined_count: joinedCount,
              waiting_count: waitingCount,
            };
          })
        );

        if (!active) return;

        setReport(reportData);
        setDeals(dealsWithCounts);
      } catch (err) {
        if (!active) return;

        setError(getErrorMessage(err));
        setReport(null);
        setDeals([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // FILTERS
  // ==========================================

  const invalidRange = Boolean(
    startDate && endDate && startDate > endDate
  );

  const filtered = useMemo(() => {
    if (invalidRange) return [];

    const query = search.trim().toLowerCase();

    return deals.filter((deal) => {
      const matchesSearch = String(
        deal.product_name ?? ""
      )
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        status === "all" ||
        String(deal.status).toLowerCase() === status;

      const deadline = deal.deadline
        ? new Date(deal.deadline)
        : null;

      const deadlineDate =
        deadline && !Number.isNaN(deadline.getTime())
          ? [
              deadline.getFullYear(),
              String(deadline.getMonth() + 1).padStart(2, "0"),
              String(deadline.getDate()).padStart(2, "0"),
            ].join("-")
          : "";

      const matchesStart =
        !startDate || deadlineDate >= startDate;

      const matchesEnd =
        !endDate || deadlineDate <= endDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    deals,
    search,
    status,
    startDate,
    endDate,
    invalidRange,
  ]);

  // ==========================================
  // FILTERED STATISTICS
  // ==========================================

  const totalParticipants = filtered.reduce(
    (sum, deal) => sum + deal.joined_count,
    0
  );

  const successful = filtered.filter(
    (deal) => deal.status === "SUCCESSFUL"
  ).length;

  const active = filtered.filter(
    (deal) => deal.status === "ACTIVE"
  ).length;

  const failed = filtered.filter(
    (deal) => deal.status === "FAILED"
  ).length;

  // Backend sales summary.
  // This is seller-wide, not affected by table filters.
  const salesSummary = report?.sales_summary;

  const totalSalesValue = Number(
    salesSummary?.total_sales_value ?? 0
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SellerLayout title="Reports">
      {/* INTRO */}
      <section className="sr-intro">
        <div>
          <small>SELLER ANALYTICS</small>

          <h2>Deal Performance Reports</h2>

          <p>
            Explore your group deals, filter results
            and export a CSV report.
          </p>
        </div>

        <button
          type="button"
          className="sr-download"
          disabled={
            loading ||
            filtered.length === 0 ||
            invalidRange
          }
          onClick={() =>
            downloadCSV(
              filtered,
              "bulkbuddy-seller-report.csv"
            )
          }
        >
          <Download size={18} />
          Download CSV
        </button>
      </section>

      {/* LOADING / ERROR */}
      {loading && (
        <p className="sr-disclaimer">
          Loading real seller reports...
        </p>
      )}

      {error && (
        <p className="sr-error" role="alert">
          {error}
        </p>
      )}

      {/* STATISTICS */}
      <section className="sr-stats">
        {[
          {
            title: "Filtered Deals",
            value: filtered.length,
            icon: BarChart3,
          },
          {
            title: "Successful Deals",
            value: successful,
            icon: CheckCircle2,
          },
          {
            title: "Joined Participants",
            value: totalParticipants,
            icon: Users,
          },
          {
            title: "Total COD Sales Value",
            value: report
              ? formatPrice(totalSalesValue)
              : "—",
            icon: TrendingUp,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="sr-stat"
              key={item.title}
            >
              <div className="sr-stat-icon">
                <Icon size={22} />
              </div>

              <span>{item.title}</span>

              <strong>
                {loading ? "—" : item.value}
              </strong>
            </article>
          );
        })}
      </section>

      {/* FILTER REPORTS */}
      <section className="sr-panel">
        <div className="sr-panel-heading">
          <div>
            <h2>Filter Reports</h2>
            <p>Dates refer to the deal deadline.</p>
          </div>
        </div>

        <div className="sr-filters">
          <label>
            Search Deal

            <div className="sr-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search product..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </label>

          <label>
            Status

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="successful">Successful</option>
              <option value="failed">Failed</option>
            </select>
          </label>

          <label>
            From Date

            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
          </label>

          <label>
            To Date

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="sr-reset"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        {invalidRange && (
          <p className="sr-error" role="alert">
            From Date cannot be later than To Date.
          </p>
        )}
      </section>

      {/* DEAL REPORT TABLE */}
      <section className="sr-panel">
        <div className="sr-panel-heading">
          <div>
            <h2>Deal Reports</h2>

            <p>
              Showing {filtered.length} of {deals.length} deals
            </p>
          </div>

          <button
            type="button"
            className="sr-export-secondary"
            disabled={
              loading ||
              filtered.length === 0 ||
              invalidRange
            }
            onClick={() =>
              downloadCSV(
                filtered,
                "bulkbuddy-filtered-deals.csv"
              )
            }
          >
            <FileSpreadsheet size={17} />
            Export CSV
          </button>
        </div>

        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Deal ID</th>
                <th>Group Price</th>
                <th>Buyers</th>
                <th>Progress</th>
                <th>Status</th>
                <th>End Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((deal) => {
                const progress =
                  deal.minimum_buyers > 0
                    ? Math.min(
                        Math.round(
                          (deal.joined_count /
                            deal.minimum_buyers) *
                            100
                        ),
                        100
                      )
                    : 0;

                return (
                  <tr key={deal.id}>
                    <td>
                      <strong>
                        {deal.product_name}
                      </strong>
                    </td>

                    <td>#{deal.id}</td>

                    <td className="sr-price">
                      {formatPrice(
                        Number(deal.group_price)
                      )}
                    </td>

                    <td>
                      {deal.joined_count}/
                      {deal.minimum_buyers}
                    </td>

                    <td>
                      <div className="sr-progress-label">
                        {progress}%
                      </div>

                      <div className="sr-progress">
                        <span
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span
                        className={`sr-status ${String(
                          deal.status
                        ).toLowerCase()}`}
                      >
                        {deal.status}
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
                    colSpan={7}
                    className="sr-empty"
                  >
                    {loading
                      ? "Loading deal reports..."
                      : "No matching reports found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="sr-summary">
        <div>
          <Clock3 size={19} />
          <span>Active</span>
          <strong>{active}</strong>
        </div>

        <div>
          <CheckCircle2 size={19} />
          <span>Successful</span>
          <strong>{successful}</strong>
        </div>

        <div>
          <XCircle size={19} />
          <span>Failed</span>
          <strong>{failed}</strong>
        </div>
      </section>

      <p className="sr-disclaimer">
        Deal statistics use real seller deals and
        participation records. COD sales value comes
        from the seller report API and is not the same
        as received payment. The COD sales summary
        covers all seller deals, while table filters
        affect only the deal statistics shown above.
      </p>
    </SellerLayout>
  );
}
