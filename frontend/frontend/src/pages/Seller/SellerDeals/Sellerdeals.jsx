import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getSellerDeals,
  deleteDeal,
} from "../../../services/dealservice";

import "./SellerDeals.css";

function SellerDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SELLER DEALS
  // ==========================================
  useEffect(() => {
    const loadSellerDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSellerDeals();

        setDeals(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Seller deals error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load seller deals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSellerDeals();
  }, []);

  // ==========================================
  // DELETE DEAL
  // ==========================================
  const handleDelete = async (dealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDeal(dealId);

      // Remove deleted deal from the page
      setDeals((currentDeals) =>
        currentDeals.filter(
          (deal) => deal.id !== dealId
        )
      );

      alert("Deal deleted successfully");
    } catch (error) {
      console.error(
        "Delete deal error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete deal."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="seller-deals-page">
        <div className="container">
          <p>Loading deals...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-deals-page">
      <div className="container">

        {/* HEADER */}
        <div className="seller-deals-header">
          <div>
            <span>Seller Center</span>

            <h1>My Deals</h1>

            <p>
              View and manage your
              group-buying deals.
            </p>
          </div>

          <Link
            to="/seller/create-deal"
            className="seller-new-deal"
          >
            + Create Deal
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="seller-deals-error">
            {error}
          </div>
        )}

        {/* NO DEALS */}
        {!error && deals.length === 0 ? (
          <div className="seller-empty-deals">

            <p>
              You have not created any deals yet.
            </p>

            <Link to="/seller/create-deal">
              Create your first deal
            </Link>

          </div>
        ) : !error ? (

          /* DEAL TABLE */
          <div className="seller-deals-table-wrapper">

            <table className="seller-deals-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Group Price</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {deals.map((deal) => {

                  const groupPrice = Number(
                    deal.group_price ?? 0
                  );

                  const minimumBuyers = Number(
                    deal.minimum_buyers ?? 0
                  );

                  const participantCount = Number(
                    deal.current_participants ?? 0
                  );

                  const status =
                    deal.status || "ACTIVE";

                  return (
                    <tr key={deal.id}>

                      {/* PRODUCT */}
                      <td className="seller-product-name">
                        {deal.product_name}
                      </td>

                      {/* GROUP PRICE */}
                      <td>
                        Rs.{" "}
                        {groupPrice.toLocaleString()}
                      </td>

                      {/* PARTICIPANTS */}
                      <td>
                        {participantCount} /{" "}
                        {minimumBuyers}
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`seller-deal-status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="seller-deal-actions">

                          {/* VIEW PARTICIPANTS */}
                          <Link
                            to={`/seller/deals/${deal.id}/participants`}
                          >
                            Participants
                          </Link>

                          {/* DELETE DEAL */}
                          <button
                            type="button"
                            className="seller-delete-deal"
                            onClick={() =>
                              handleDelete(deal.id)
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        ) : null}

      </div>
    </main>
  );
}

export default SellerDeals;