import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/protectRoute/ProtectedRoute";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Deals from "./pages/Deals/Deals";
import DealDetails from "./pages/DealsDetails/DealsDetails";
import MyDeals from "./pages/MyDeals/MyDeals";
import NotFound from "./pages/Notfound/NotFound";

import SellerDashboard from "./pages/Seller/SellerDashboard/SellerDashboard";
import SellerDeals from "./pages/Seller/SellerDeals/SellerDeals";
import CreateDeal from "./pages/Seller/CreateDeal/CreateDeal";
import CsvImport from "./pages/Seller/CsvImport/Csvimport";
import DealParticipants from "./pages/Seller/Dealparticipants/Dealparticipants";
import Reports from "./pages/Seller/Reports/Reports";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="app-content">
        <Routes>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route
            path="/deals/:dealId"
            element={<DealDetails />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer */}
          <Route
            path="/my-deals"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyDeals />
              </ProtectedRoute>
            }
          />

          {/* Seller */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={["SELLER"]}>
                <SellerDashboard />
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
                <CreateDeal />
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
            path="/seller/import-csv"
            element={
              <ProtectedRoute allowedRoles={["SELLER"]}>
                <CsvImport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/deals/:dealId/participants"
            element={
              <ProtectedRoute allowedRoles={["SELLER"]}>
                <DealParticipants />
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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;