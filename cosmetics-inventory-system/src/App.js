// /client/src/App.js
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
// Updated file paths to /pages directory
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import "./App.css"; // import the CSS file

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="logo">Cosmetics Inventory</div>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Home</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Dashboard</NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Products</NavLink>
            <NavLink to="/sales" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Sales</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Contact</NavLink>
          </div>
        </nav>

        {/* Use a <main> tag for semantics and consistent padding */}
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;