
// import { Routes, Route, Link } from "react-router-dom";

// import Navbar from "./components/Navbar/Navbar.jsx";
// import Home from "./pages/Home/Home.jsx";
// import Deals from "./pages/Deals/Deals.jsx";

// import "./App.css";

// function PlaceholderPage({ title }) {
//   return (
//     <main className="placeholder-page">
//       <h1>{title}</h1>

//       <p>
//         This page will be developed in the next steps.
//       </p>

//       <Link to="/">Back to Home</Link>
//     </main>
//   );
// }

// export default function App() {
//   return (
//     <>
//       <Navbar />

//       <Routes>
//         <Route
//           path="/"
//           element={<Home />}
//         />

//         <Route
//           path="/deals"
//           element={<Deals />}
//         />

//         <Route
//           path="/deals/:id"
//           element={
//             <PlaceholderPage title="Deal Details" />
//           }
//         />

//         <Route
//           path="/how-it-works"
//           element={
//             <PlaceholderPage title="How It Works" />
//           }
//         />

//         <Route
//           path="/about"
//           element={
//             <PlaceholderPage title="About BulkBuddy" />
//           }
//         />

//         <Route
//           path="/login"
//           element={
//             <PlaceholderPage title="Login" />
//           }
//         />

//         <Route
//           path="/register"
//           element={
//             <PlaceholderPage title="Register" />
//           }
//         />

//         <Route
//           path="*"
//           element={
//             <PlaceholderPage title="Page Not Found" />
//           }
//         />
//       </Routes>
//     </>
//   );
// }


import { Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";

import Home from "./pages/Home/Home.jsx";
import Deals from "./pages/Deals/Deals.jsx";
import DealsDetails from "./pages/DealsDetails/DealsDetails.jsx";

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

import MyDeals from "./pages/MyDeals/MyDeals.jsx";

import SellerDashboard from "./pages/Seller/SellerDashboard/SellerDashboard.jsx";
import Createdeal from "./pages/Seller/CreateDeal/Createdeal.jsx";
import Reports from "./pages/Seller/Reports/Reports.jsx";

import "./App.css";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <h1>{title}</h1>
      <p>This page will be developed in the next steps.</p>
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
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<DealsDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/my-deals" element={<MyDeals />} />
        <Route
          path="/customer/dashboard"
          element={<MyDeals />}
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
          path="/seller/reports"
          element={<Reports />}
        />

        <Route
          path="/seller/deals"
          element={<PlaceholderPage title="Seller Deals" />}
        />
        <Route
          path="/seller/import"
          element={<PlaceholderPage title="Import CSV" />}
        />
        <Route
          path="/seller/settings"
          element={<PlaceholderPage title="Seller Settings" />}
        />

        <Route
          path="/how-it-works"
          element={<PlaceholderPage title="How It Works" />}
        />
        <Route
          path="/about"
          element={<PlaceholderPage title="About BulkBuddy" />}
        />

        <Route
          path="*"
          element={<PlaceholderPage title="Page Not Found" />}
        />
      </Routes>
    </>
  );
}

