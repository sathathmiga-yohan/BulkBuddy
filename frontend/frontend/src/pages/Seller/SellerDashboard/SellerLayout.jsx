
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3, FileSpreadsheet, LayoutDashboard,
  LogOut, Menu, Package, Plus, Settings,
  ShoppingBag, X
} from "lucide-react";
import "./SellerLayout.css";

const links = [
  { name: "Dashboard", path: "/seller/dashboard", icon: LayoutDashboard },
  { name: "My Deals", path: "/seller/deals", icon: Package },
  { name: "Create Deal", path: "/seller/create-deal", icon: Plus },
  { name: "Import CSV", path: "/seller/import", icon: FileSpreadsheet },
  { name: "Reports", path: "/seller/reports", icon: BarChart3 },
  { name: "Settings", path: "/seller/settings", icon: Settings }
];

export default function SellerLayout({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <main className="bb-seller-page">
      <div className="bb-seller-layout">
        {open && (
          <button
            className="bb-seller-overlay"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        )}

        <aside className={`bb-seller-sidebar ${open ? "open" : ""}`}>
          <div className="bb-seller-brand">
            <ShoppingBag size={23} />
            <div>
              <strong>Seller Panel</strong>
              <small>BulkBuddy Marketplace</small>
            </div>
            <button
              className="bb-seller-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          <p className="bb-seller-menu-label">MAIN MENU</p>

          <nav className="bb-seller-nav">
            {links.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => isActive ? "active" : ""}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="bb-seller-sidebar-bottom">
            <div className="bb-seller-user">
              <span className="bb-seller-avatar">S</span>
              <div>
                <strong>Demo Seller</strong>
                <small>Seller Account</small>
              </div>
            </div>
            <Link to="/login">
              <LogOut size={18} /> Logout (Demo)
            </Link>
          </div>
        </aside>

        <section className="bb-seller-content">
          <header className="bb-seller-topbar">
            <div className="bb-seller-topbar-left">
              <button
                className="bb-seller-menu-button"
                onClick={() => setOpen(true)}
                aria-label="Open seller menu"
              >
                <Menu size={22} />
              </button>
              <div>
                <small>Seller / {title}</small>
                <h1>{title}</h1>
              </div>
            </div>
            <span className="bb-seller-avatar">S</span>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
