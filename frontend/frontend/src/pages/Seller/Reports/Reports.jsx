
import { useMemo, useState } from "react";
import {
  BarChart3, CheckCircle2, Clock3,
  Download, FileSpreadsheet, Search,
  TrendingUp, Users, XCircle
} from "lucide-react";
import SellerLayout from "../SellerDashboard/SellerLayout.jsx";
import { sellerDeals } from "../sellerMockData.js";
import { formatPrice } from "../../../data/mockDeals.js";
import "./Reports.css";

function downloadCSV(rows, filename) {
  const headers = [
    "Deal ID",
    "Deal Name",
    "Category",
    "Group Price (LKR)",
    "Participants",
    "Required Buyers",
    "Status",
    "End Date"
  ];

  const values = rows.map(deal => [
    deal.id,
    deal.name,
    deal.category,
    deal.groupPrice,
    deal.participants,
    deal.required,
    deal.status,
    deal.endDate
  ]);

  const escapeCell = value =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [headers, ...values]
    .map(row => row.map(escapeCell).join(","))
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

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const invalidRange =
    Boolean(startDate && endDate && startDate > endDate);

  const filtered = useMemo(() => {
    if (invalidRange) return [];

    return sellerDeals.filter(deal => {
      const matchesSearch =
        `${deal.name} ${deal.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" || deal.status === status;

      const matchesStart =
        !startDate || deal.endDate >= startDate;

      const matchesEnd =
        !endDate || deal.endDate <= endDate;

      return matchesSearch &&
        matchesStatus &&
        matchesStart &&
        matchesEnd;
    });
  }, [search, status, startDate, endDate, invalidRange]);

  const totalParticipants = filtered.reduce(
    (sum, deal) => sum + deal.participants,
    0
  );

  const successful = filtered.filter(
    deal => deal.status === "successful"
  ).length;

  const active = filtered.filter(
    deal => deal.status === "active"
  ).length;

  const failed = filtered.filter(
    deal => deal.status === "failed"
  ).length;

  // Estimated value based on joined buyers in this demo.
  // This is not verified revenue or received payment.
  const estimatedValue = filtered.reduce(
    (sum, deal) =>
      sum + deal.groupPrice * deal.participants,
    0
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <SellerLayout title="Reports">
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
          disabled={filtered.length === 0 || invalidRange}
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

      <section className="sr-stats">
        {[
          {
            title: "Filtered Deals",
            value: filtered.length,
            icon: BarChart3
          },
          {
            title: "Successful Deals",
            value: successful,
            icon: CheckCircle2
          },
          {
            title: "Total Participants",
            value: totalParticipants,
            icon: Users
          },
          {
            title: "Estimated Deal Value",
            value: formatPrice(estimatedValue),
            icon: TrendingUp
          }
        ].map(item => {
          const Icon = item.icon;
          return (
            <article className="sr-stat" key={item.title}>
              <div className="sr-stat-icon">
                <Icon size={22} />
              </div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="sr-panel">
        <div className="sr-panel-heading">
          <div>
            <h2>Filter Reports</h2>
            <p>Dates refer to the deal end date.</p>
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
                onChange={event => setSearch(event.target.value)}
              />
            </div>
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={event => setStatus(event.target.value)}
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
              onChange={event => setStartDate(event.target.value)}
            />
          </label>

          <label>
            To Date
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={event => setEndDate(event.target.value)}
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

      <section className="sr-panel">
        <div className="sr-panel-heading">
          <div>
            <h2>Deal Reports</h2>
            <p>
              Showing {filtered.length} of {sellerDeals.length} demo deals
            </p>
          </div>

          <button
            type="button"
            className="sr-export-secondary"
            disabled={filtered.length === 0 || invalidRange}
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
                <th>Category</th>
                <th>Group Price</th>
                <th>Buyers</th>
                <th>Progress</th>
                <th>Status</th>
                <th>End Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(deal => {
                const progress = Math.min(
                  Math.round(
                    deal.participants / deal.required * 100
                  ),
                  100
                );

                return (
                  <tr key={deal.id}>
                    <td>
                      <strong>{deal.name}</strong>
                    </td>
                    <td>{deal.category}</td>
                    <td className="sr-price">
                      {formatPrice(deal.groupPrice)}
                    </td>
                    <td>
                      {deal.participants}/{deal.required}
                    </td>
                    <td>
                      <div className="sr-progress-label">
                        {progress}%
                      </div>
                      <div className="sr-progress">
                        <span
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`sr-status ${deal.status}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td>{deal.endDate}</td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="sr-empty">
                    No matching reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
        All figures are mock data. Estimated Deal Value
        is calculated from group price multiplied by
        participant count; it does not represent
        confirmed revenue or payments.
      </p>
    </SellerLayout>
  );
}
