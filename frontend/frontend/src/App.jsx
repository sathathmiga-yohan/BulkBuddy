import { Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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

        {/* PUBLIC PAGES */}

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
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        {/* CUSTOMER PAGES */}

        <Route
          path="/my-deals"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <MyDeals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <MyDeals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/create-deal"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <Createdeal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/deals"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <SellerDeals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/import"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <CsvImport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/participants"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <Dealparticipants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/reports"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/settings"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <PlaceholderPage title="Seller Settings" />
            </ProtectedRoute>
          }
        />

        {/* PAGE NOT FOUND */}

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