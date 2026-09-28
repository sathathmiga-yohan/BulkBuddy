import { useEffect, useState } from "react";
import DealCard from "../../components/DealCard/DealCard";
import { getDeals } from "../../services/dealservice";
import "./Deals.css";

function Deals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ACTIVE DEALS
  // ==========================================
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDeals();

        const formattedDeals = Array.isArray(data)
          ? data.map((deal) => ({
              id: deal.id,

              productName:
                deal.product_name || "Deal",

              description:
                deal.description || "",

              normalPrice: Number(
                deal.normal_price ?? 0
              ),

              groupPrice: Number(
                deal.group_price ?? 0
              ),

              minimumBuyers: Number(
                deal.minimum_buyers ?? 0
              ),

              maximumQuantity: Number(
                deal.maximum_quantity ?? 0
              ),

              // Exact backend field
              currentBuyers: Number(
                deal.current_participants ?? 0
              ),

              deadline: deal.deadline,

              status:
                deal.status || "ACTIVE",

              sellerId:
                deal.seller_id,

              icon: "🛍️",
            }))
          : [];

        setDeals(formattedDeals);
      } catch (error) {
        console.error(
          "Load deals error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Failed to load deals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredDeals = deals.filter(
    (deal) =>
      deal.productName
        .toLowerCase()
        .includes(
          searchTerm
            .trim()
            .toLowerCase()
        )
  );

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="deals-page">
        <div className="container">
          <p>Loading deals...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="deals-page">

      {/* HEADER */}
      <section className="deals-header">
        <div className="container">

          <span className="deals-label">
            Group Buying
          </span>

          <h1>Explore Active Deals</h1>

          <p>
            Find a product you love, join the
            group and unlock better prices
            together.
          </p>

        </div>
      </section>

      {/* CONTENT */}
      <section className="deals-content">
        <div className="container">

          {/* ERROR */}
          {error && (
            <div className="deals-error">
              {error}
            </div>
          )}

          {!error && (
            <>
              {/* SEARCH */}
              <div className="deals-toolbar">

                <div className="deals-search">

                  <span className="search-icon">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="deal-count">
                  {filteredDeals.length}{" "}
                  {filteredDeals.length === 1
                    ? "deal"
                    : "deals"}{" "}
                  found
                </div>

              </div>

              {/* DEALS */}
              {filteredDeals.length > 0 ? (
                <div className="all-deals-grid">

                  {filteredDeals.map(
                    (deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                      />
                    )
                  )}

                </div>
              ) : (
                <div className="no-deals">

                  <div className="no-deals-icon">
                    🔎
                  </div>

                  <h2>No deals found</h2>

                  <p>
                    {searchTerm
                      ? "Try searching with another product name."
                      : "There are no active deals available right now."}
                  </p>

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                    >
                      Clear Search
                    </button>
                  )}

                </div>
              )}
            </>
          )}

        </div>
      </section>

    </main>
  );
}

export default Deals;