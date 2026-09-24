import { useState } from "react";
import DealCard from "../../components/DealCard/DealCard";
import "./Deals.css";

function Deals() {
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary frontend data.
  // Later this will come from GET /deals.
  const deals = [
    {
      id: 1,
      productName: "Smart Watch",
      description: "Special group buying offer for a smart watch.",
      normalPrice: 8500,
      groupPrice: 6500,
      minimumBuyers: 5,
      currentBuyers: 3,
      deadline: "2 days left",
      icon: "⌚",
    },
    {
      id: 2,
      productName: "Wireless Headphones",
      description: "Join the group and save on wireless headphones.",
      normalPrice: 12000,
      groupPrice: 9000,
      minimumBuyers: 6,
      currentBuyers: 4,
      deadline: "3 days left",
      icon: "🎧",
    },
    {
      id: 3,
      productName: "Laptop Bag",
      description: "A practical laptop bag at a better group price.",
      normalPrice: 5000,
      groupPrice: 4000,
      minimumBuyers: 4,
      currentBuyers: 3,
      deadline: "4 days left",
      icon: "💼",
    },
    {
      id: 4,
      productName: "Wireless Mouse",
      description: "Get a wireless mouse for less through group buying.",
      normalPrice: 3500,
      groupPrice: 2800,
      minimumBuyers: 5,
      currentBuyers: 2,
      deadline: "5 days left",
      icon: "🖱️",
    },
    {
      id: 5,
      productName: "Bluetooth Speaker",
      description: "Portable Bluetooth speaker with a special group price.",
      normalPrice: 7500,
      groupPrice: 5900,
      minimumBuyers: 6,
      currentBuyers: 5,
      deadline: "1 day left",
      icon: "🔊",
    },
    {
      id: 6,
      productName: "Backpack",
      description: "Everyday backpack available through a group deal.",
      normalPrice: 6000,
      groupPrice: 4500,
      minimumBuyers: 4,
      currentBuyers: 1,
      deadline: "6 days left",
      icon: "🎒",
    },
  ];

  const filteredDeals = deals.filter((deal) =>
    deal.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <main className="deals-page">
      <section className="deals-header">
        <div className="container">
          <span className="deals-label">Group Buying</span>

          <h1>Explore Active Deals</h1>

          <p>
            Find a product you love, join the group and unlock
            better prices together.
          </p>
        </div>
      </section>

      <section className="deals-content">
        <div className="container">
          <div className="deals-toolbar">
            <div className="deals-search">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="deal-count">
              {filteredDeals.length}{" "}
              {filteredDeals.length === 1 ? "deal" : "deals"} found
            </div>
          </div>

          {filteredDeals.length > 0 ? (
            <div className="all-deals-grid">
              {filteredDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                />
              ))}
            </div>
          ) : (
            <div className="no-deals">
              <div className="no-deals-icon">🔎</div>

              <h2>No deals found</h2>

              <p>
                Try searching with another product name.
              </p>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Deals;