import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getDealOutcomes,
  getParticipationReport,
  getSellerSales,
} from "../../../services/reportservice";

import "./Reports.css";

function Reports() {
  const [outcomes, setOutcomes] = useState(null);

  const [participation, setParticipation] =
    useState(null);

  const [sales, setSales] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          outcomeData,
          participationData,
          salesData,
        ] = await Promise.all([
          getDealOutcomes(),
          getParticipationReport(),
          getSellerSales(),
        ]);

        setOutcomes(outcomeData);
        setParticipation(participationData);
        setSales(salesData);
      } catch (error) {
        console.error(
          "Reports error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // ==========================================
  // DEAL OUTCOME REPORT
  // Backend:
  // {
  //   total_deals,
  //   deals: [...]
  // }
  // ==========================================

  const outcomeDeals =
    outcomes?.deals || [];

  const totalDeals =
    outcomes?.total_deals ?? 0;

  // ==========================================
  // PARTICIPATION REPORT
  // Backend directly gives these values
  // ==========================================

  const activeDeals =
    participation?.active_deals ?? 0;

  const successfulDeals =
    participation?.successful_deals ?? 0;

  const failedDeals =
    participation?.failed_deals ?? 0;

  const totalParticipants =
    participation?.total_participations ?? 0;

  // ==========================================
  // SALES REPORT
  // Backend field:
  // committed_sales_value
  // ==========================================

  const totalSales =
    sales?.committed_sales_value ?? 0;

  return (
    <main className="reports-page">
      <div className="container">

        <Link
          to="/seller/dashboard"
          className="reports-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="reports-header">
          <span>Seller Center</span>

          <h1>Deal Reports</h1>

          <p>
            Track your deal performance and
            customer participation.
          </p>
        </div>

        {loading && (
          <p>Loading reports...</p>
        )}

        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ============================= */}
            {/* TOP SUMMARY */}
            {/* ============================= */}

            <div className="report-summary-grid">

              <div className="report-summary-card">
                <div className="report-icon">
                  📦
                </div>

                <div>
                  <p>Total Deals</p>
                  <h2>{totalDeals}</h2>
                </div>
              </div>

              <div className="report-summary-card">
                <div className="report-icon">
                  🔥
                </div>

                <div>
                  <p>Active Deals</p>
                  <h2>{activeDeals}</h2>
                </div>
              </div>

              <div className="report-summary-card">
                <div className="report-icon">
                  ✅
                </div>

                <div>
                  <p>Successful</p>
                  <h2>{successfulDeals}</h2>
                </div>
              </div>

              <div className="report-summary-card">
                <div className="report-icon">
                  👥
                </div>

                <div>
                  <p>Participants</p>
                  <h2>{totalParticipants}</h2>
                </div>
              </div>

            </div>

            {/* ============================= */}
            {/* DEAL OUTCOME SECTION */}
            {/* ============================= */}

            <section className="report-section">

              <div className="report-section-heading">
                <div>
                  <h2>Deal Outcomes</h2>

                  <p>
                    Summary of your group-buying
                    deal performance.
                  </p>
                </div>
              </div>

              <div className="report-summary-grid">

                <div className="report-summary-card">
                  <div className="report-icon">
                    📊
                  </div>

                  <div>
                    <p>Successful Deals</p>
                    <h2>
                      {successfulDeals}
                    </h2>
                  </div>
                </div>

                <div className="report-summary-card">
                  <div className="report-icon">
                    ❌
                  </div>

                  <div>
                    <p>Failed Deals</p>
                    <h2>
                      {failedDeals}
                    </h2>
                  </div>
                </div>

                <div className="report-summary-card">
                  <div className="report-icon">
                    💰
                  </div>

                  <div>
                    <p>Committed Sales</p>

                    <h2>
                      Rs.{" "}
                      {Number(
                        totalSales
                      ).toLocaleString()}
                    </h2>
                  </div>
                </div>

              </div>

              {/* =========================== */}
              {/* DEAL TABLE */}
              {/* =========================== */}

              {outcomeDeals.length > 0 ? (
                <div className="report-table-wrapper">

                  <table className="report-table">

                    <thead>
                      <tr>
                        <th>Deal</th>
                        <th>Participants</th>
                        <th>Target</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {outcomeDeals.map(
                        (deal) => {

                          const participants =
                            Number(
                              deal.participant_count ??
                                0
                            );

                          const target =
                            Number(
                              deal.minimum_buyers ??
                                0
                            );

                          const progress =
                            target > 0
                              ? Math.min(
                                  (participants /
                                    target) *
                                    100,
                                  100
                                )
                              : 0;

                          return (
                            <tr
                              key={deal.deal_id}
                            >

                              <td className="report-product">
                                {
                                  deal.product_name
                                }
                              </td>

                              <td>
                                {participants}
                              </td>

                              <td>
                                {target}
                              </td>

                              <td>
                                <div className="report-progress-wrapper">

                                  <div className="report-progress">
                                    <div
                                      className="report-progress-fill"
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />
                                  </div>

                                  <span>
                                    {Math.round(
                                      progress
                                    )}
                                    %
                                  </span>

                                </div>
                              </td>

                              <td>
                                <span
                                  className={`report-status ${String(
                                    deal.status
                                  ).toLowerCase()}`}
                                >
                                  {deal.status}
                                </span>
                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>
                  </table>

                </div>
              ) : (
                <p>
                  No deal report data available.
                </p>
              )}

            </section>
          </>
        )}

      </div>
    </main>
  );
}

export default Reports;