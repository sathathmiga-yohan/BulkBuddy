
import { Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";

import Home from "./pages/Home/Home.jsx";
import Deals from "./pages/Deals/Deals.jsx";
import DealsDetails from "./pages/DealsDetails/DealsDetails.jsx";

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

import MyDeals from "./pages/MyDeals/MyDeals.jsx";

import HowItWorks from "./pages/HowItWorks/HowItWorks.jsx";
import About from "./pages/About/About.jsx";

import SellerDashboard from "./pages/Seller/SellerDashboard/SellerDashboard.jsx";
import Createdeal from "./pages/Seller/CreateDeal/Createdeal.jsx";
import SellerDeals from "./pages/Seller/SellerDeals/SellerDeals.jsx";
import CsvImport from "./pages/Seller/CsvImport/CsvImport.jsx";
import Dealparticipants from "./pages/Seller/Dealparticipants/Dealparticipants.jsx";
import Reports from "./pages/Seller/Reports/Reports.jsx";

import "./App.css";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <h1>{title}</h1>

      <p>
        This page will be developed in the next steps.
      </p>

      <Link to="/">Back to Home</Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/deals"
          element={<Deals />}
        />

        <Route
          path="/deals/:id"
          element={<DealsDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/my-deals"
          element={<MyDeals />}
        />

        <Route
          path="/customer/dashboard"
          element={<MyDeals />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/seller/dashboard"
          element={<SellerDashboard />}
        />

        <Route
          path="/seller/create-deal"
          element={<Createdeal />}
        />

        <Route
          path="/seller/deals"
          element={<SellerDeals />}
        />

        <Route
          path="/seller/import"
          element={<CsvImport />}
        />

        <Route
          path="/seller/participants"
          element={<Dealparticipants />}
        />

        <Route
          path="/seller/reports"
          element={<Reports />}
        />

        <Route
          path="/seller/settings"
          element={
            <PlaceholderPage title="Seller Settings" />
          }
        />

        <Route
          path="*"
          element={
            <PlaceholderPage title="Page Not Found" />
          }
        />
      </Routes>
    </>
  );
}
