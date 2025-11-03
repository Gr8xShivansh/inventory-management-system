// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { getDashboardData } from "../services/api"; // Use API service
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

// Helper to format currency
const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

// Helper to format date for tables
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getDashboardData();
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#B5838D", "#E4DADC", "#77A07B", "#E8A87C", "#D98C8C"];

  if (isLoading) {
    return <Loader text="Loading Dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!data) {
    return <p>No dashboard data found.</p>;
  }

  const { stats, charts, alerts, recentProducts } = data;

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
    { label: "Total Profit", value: formatCurrency(stats.totalProfit) },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Categories", value: stats.totalCategories },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back!</h1>
        <p>Here’s a quick overview of your store performance.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="glass-card" style={{ textAlign: "center" }}>
            <p className="stat-label">{s.label}</p>
            <h2 className="stat-value">{s.value}</h2>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="glass-card chart-container">
        <h2 className="section-title">Revenue (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={charts.revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4DADC" />
            <XAxis dataKey="date" stroke="#3D3D3D" />
            <YAxis stroke="#3D3D3D" tickFormatter={formatCurrency} />
            <Tooltip formatter={(val) => formatCurrency(val)} />
            <Line type="monotone" dataKey="revenue" stroke="#B5838D" strokeWidth={3} dot={{ r: 5, fill: "#B5838D" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category pie */}
      <div className="glass-card chart-container">
        <h2 className="section-title">Sales Split by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={charts.categorySplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
              {charts.categorySplit.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => formatCurrency(val)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Low Stock */}
        <div className="glass-card">
          <h2 className="section-title status-warning">Low Stock Products</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="recent-products-table">
              <thead>
                <tr><th>Name</th><th>Stock</th><th>Alert Level</th></tr>
              </thead>
              <tbody>
                {alerts.lowStock.map((p) => (
                  <tr key={p._id}><td>{p.name}</td><td>{p.stock}</td><td>{p.lowStockAlert ?? "-"}</td></tr>
                ))}
                {alerts.lowStock.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center" }}>All products are well-stocked.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURE UPDATED: Expiry Alerts */}
        <div className="glass-card">
          <h2 className="section-title status-error">Expiry Alerts (Expired & Near Expiry)</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="recent-products-table">
              <thead>
                <tr><th>Name</th><th>Expiry Date</th><th>Status (Days)</th></tr>
              </thead>
              <tbody>
                {alerts.expiryAlerts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{formatDate(p.expiryDate)}</td>
                    <td className={p.daysLeft <= 0 ? "status-error" : (p.daysLeft <= 30 ? "status-warning" : "")}>
                      {p.daysLeft <= 0 ? `Expired (${p.daysLeft})` : `${p.daysLeft} days left`}
                    </td>
                  </tr>
                ))}
                {alerts.expiryAlerts.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center" }}>No products near expiry.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Recent products */}
      <div className="glass-card">
        <h2 className="section-title">Recently Added Products</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Sale Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((prod) => (
                <tr key={prod._id}>
                  <td>{prod.name}</td>
                  <td>{prod.category}</td>
                  <td>{prod.stock}</td>
                  <td>{formatCurrency(prod.salePrice)}</td>
                  <td>
                    {prod.stock === 0 ? (
                      <span className="status-error">Out of Stock</span>
                    ) : (alerts.lowStock.find(p => p._id === prod._id)) ? (
                      <span className="status-warning">Low Stock</span>
                    ) : (
                      <span className="status-success">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;