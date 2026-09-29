
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Grid2X2,
  List,
  Heart,
  Star,
  Clock3,
  Users,
  ArrowRight,
  X,
  RotateCcw,
  ChevronDown
} from "lucide-react";

import {
  mockDeals,
  dealCategories,
  formatPrice
} from "../../data/mockDeals.js";

import "./Deals.css";

const priceOptions = [
  { label: "All Prices", value: "all" },
  { label: "Under Rs. 5,000", value: "5000" },
  { label: "Under Rs. 10,000", value: "10000" },
  { label: "Under Rs. 20,000", value: "20000" },
  { label: "Under Rs. 50,000", value: "50000" }
];

function DealCard({ deal, isFavourite, onFavourite }) {
  const progress = Math.min(
    Math.round((deal.joined / deal.required) * 100),
    100
  );

  return (
    <article className="deals-card">
      <div className="deals-card-image">
        <img
          src={deal.image}
          alt={deal.name}
          loading="lazy"
        />

        <span className="deals-discount">
          -{deal.discount}%
        </span>

        <button
          type="button"
          className={`deals-heart ${
            isFavourite ? "selected" : ""
          }`}
          onClick={() => onFavourite(deal.id)}
          aria-label={
            isFavourite
              ? `Remove ${deal.name} from favourites`
              : `Add ${deal.name} to favourites`
          }
          aria-pressed={isFavourite}
        >
          <Heart
            size={18}
            fill={isFavourite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="deals-card-body">
        <div className="deals-card-meta">
          <span>{deal.category}</span>

          <span className="deals-rating">
            <Star size={13} fill="currentColor" />
            {deal.rating}
          </span>
        </div>

        <h3>{deal.name}</h3>

        <p className="deals-seller">
          By {deal.seller}
        </p>

        <div className="deals-price-row">
          <div>
            <span className="deals-price-label">
              Group Price
            </span>

            <strong>
              {formatPrice(deal.groupPrice)}
            </strong>
          </div>

          <del>
            {formatPrice(deal.originalPrice)}
          </del>
        </div>

        <div className="deals-progress-header">
          <span>
            <Users size={14} />
            {deal.joined} / {deal.required} buyers
          </span>

          <strong>{progress}%</strong>
        </div>

        <div
          className="deals-progress-track"
          role="progressbar"
          aria-label={`${deal.name} group buying progress`}
          aria-valuenow={deal.joined}
          aria-valuemin={0}
          aria-valuemax={deal.required}
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="deals-card-footer">
          <span className="deals-time">
            <Clock3 size={15} />
            {deal.daysLeft} days left
          </span>

          <Link
            to={`/deals/${deal.id}`}
            className="deals-view-button"
          >
            View Deal
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Deals() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const search = searchParams.get("search") || "";

  const [category, setCategory] =
    useState("All Categories");

  const [maxPrice, setMaxPrice] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [view, setView] = useState("grid");
  const [favourites, setFavourites] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredDeals = useMemo(() => {
    let results = mockDeals.filter((deal) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        deal.name.toLowerCase().includes(searchText) ||
        deal.category.toLowerCase().includes(searchText) ||
        deal.seller.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" ||
        deal.category === category;

      const matchesPrice =
        maxPrice === "all" ||
        deal.groupPrice <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice
      );
    });

    switch (sortBy) {
      case "price-low":
        results.sort(
          (a, b) => a.groupPrice - b.groupPrice
        );
        break;

      case "price-high":
        results.sort(
          (a, b) => b.groupPrice - a.groupPrice
        );
        break;

      case "discount":
        results.sort(
          (a, b) => b.discount - a.discount
        );
        break;

      case "ending":
        results.sort(
          (a, b) => a.daysLeft - b.daysLeft
        );
        break;

      case "popular":
        results.sort(
          (a, b) => b.joined - a.joined
        );
        break;

      default:
        break;
    }

    return results;
  }, [search, category, maxPrice, sortBy]);

  const toggleFavourite = (id) => {
    setFavourites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearFilters = () => {
    setCategory("All Categories");
    setMaxPrice("all");
    setSortBy("featured");
    setSearchParams({});
  };

  const hasFilters =
    search.trim() !== "" ||
    category !== "All Categories" ||
    maxPrice !== "all";

  return (
    <main className="deals-page">
      <section className="deals-page-banner">
        <div className="deals-container">
          <span className="deals-eyebrow">
            EXPLORE BULKBUDDY
          </span>

          <h1>
            Discover Amazing <span>Group Deals</span>
          </h1>

          <p>
            Find your favourite products, join other
            shoppers and unlock better prices together.
          </p>
        </div>
      </section>

      <div className="deals-container deals-main">
        <div className="deals-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <strong>Explore Deals</strong>
        </div>

        <div className="deals-mobile-filter-row">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? (
              <X size={17} />
            ) : (
              <SlidersHorizontal size={17} />
            )}

            {filtersOpen ? "Close Filters" : "Filters"}
          </button>
        </div>

        <div className="deals-layout">
          {/* FILTER SIDEBAR */}

          <aside
            className={`deals-sidebar ${
              filtersOpen ? "open" : ""
            }`}
          >
            <div className="deals-sidebar-heading">
              <h2>
                <SlidersHorizontal size={18} />
                Filters
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="deals-reset"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="deals-filter-section">
              <h3>Categories</h3>

              <div className="deals-category-options">
                {dealCategories.map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => setCategory(item)}
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="deals-filter-section">
              <h3>Price Range</h3>

              <div className="deals-price-options">
                {priceOptions.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="price"
                      checked={
                        maxPrice === option.value
                      }
                      onChange={() =>
                        setMaxPrice(option.value)
                      }
                    />

                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="deals-sidebar-promo">
              <div className="deals-promo-icon">
                <Users size={23} />
              </div>

              <h3>Buy More, Save More!</h3>

              <p>
                Join group deals and enjoy
                exclusive community savings.
              </p>

              <Link to="/how-it-works">
                How It Works
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

          {/* MAIN CONTENT */}

          <section className="deals-results">
            <div className="deals-toolbar">
              <div className="deals-result-count">
                <h2>All Group Deals</h2>

                <p>
                  Showing {filteredDeals.length} of{" "}
                  {mockDeals.length} products
                </p>
              </div>

              <div className="deals-toolbar-actions">
                <label className="deals-sort">
                  <span>Sort by:</span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                    aria-label="Sort deals"
                  >
                    <option value="featured">
                      Featured
                    </option>

                    <option value="popular">
                      Most Popular
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="discount">
                      Biggest Discount
                    </option>

                    <option value="ending">
                      Ending Soon
                    </option>
                  </select>

                  <ChevronDown size={14} />
                </label>

                <div
                  className="deals-view-toggle"
                  aria-label="Display layout"
                >
                  <button
                    type="button"
                    className={
                      view === "grid" ? "active" : ""
                    }
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                  >
                    <Grid2X2 size={17} />
                  </button>

                  <button
                    type="button"
                    className={
                      view === "list" ? "active" : ""
                    }
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                  >
                    <List size={19} />
                  </button>
                </div>
              </div>
            </div>

            <form
              className="deals-page-search"
              role="search"
              onSubmit={(event) =>
                event.preventDefault()
              }
            >
              <Search size={19} />

              <input
                type="search"
                placeholder="Search for products, brands or categories..."
                aria-label="Search products"
                value={search}
                onChange={(event) => {
                  const value = event.target.value;

                  setSearchParams(
                    value ? { search: value } : {},
                    { replace: true }
                  );
                }}
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchParams({})}
                >
                  <X size={18} />
                </button>
              )}
            </form>

            {hasFilters && (
              <div className="deals-active-filters">
                <span>Active filters</span>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchParams({})
                    }
                  >
                    Search: {search}
                    <X size={13} />
                  </button>
                )}

                {category !== "All Categories" && (
                  <button
                    type="button"
                    onClick={() =>
                      setCategory("All Categories")
                    }
                  >
                    {category}
                    <X size={13} />
                  </button>
                )}

                {maxPrice !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setMaxPrice("all")
                    }
                  >
                    Under {formatPrice(Number(maxPrice))}
                    <X size={13} />
                  </button>
                )}

                <button
                  type="button"
                  className="deals-clear-all"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
            )}

            {filteredDeals.length > 0 ? (
              <div
                className={`deals-products ${
                  view === "list" ? "list-view" : ""
                }`}
              >
                {filteredDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isFavourite={
                      favourites.includes(deal.id)
                    }
                    onFavourite={toggleFavourite}
                  />
                ))}
              </div>
            ) : (
              <div className="deals-empty">
                <Search size={35} />

                <h3>No matching deals found</h3>

                <p>
                  Try another search or change
                  your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
