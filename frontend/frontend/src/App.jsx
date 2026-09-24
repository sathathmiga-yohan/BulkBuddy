import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="container py-5">
        <h1>BulkBuddy</h1>
        <p>Buy Together. Save More.</p>
      </div>
      <Footer />
    </div>
  );
}

export default App;