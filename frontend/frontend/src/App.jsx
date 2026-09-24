import "./App.css";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="container py-5">
        <h1>BulkBuddy</h1>
        <p>Buy Together. Save More.</p>
      </div>
    </div>
  );
}

export default App;