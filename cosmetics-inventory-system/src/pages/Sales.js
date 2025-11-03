// src/pages/Sales.js
import React, { useEffect, useMemo, useState } from "react";
import {
  getSales,
  addSale,
  deleteSale,
  getProducts,
} from "../services/api";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

// Helper to format currency
const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-CA"); // YYYY-MM-DD
};

const INITIAL_FORM_STATE = {
  product: "", // This will be the _id
  unitsSold: "1",
  date: new Date().toISOString().split("T")[0],
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  
  // **NEW:** State for the modal's product search
  const [productSearchTerm, setProductSearchTerm] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch in parallel
      const [salesRes, productsRes] = await Promise.all([getSales(), getProducts()]);
      setProducts(productsRes.data || []);
      setSales(salesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleSales = useMemo(() => {
    let arr = [...sales];
    if (filter.trim()) {
      const f = filter.toLowerCase();
      arr = arr.filter(
        (s) =>
          (s.productName || "").toLowerCase().includes(f) ||
          (s.sku || "").toLowerCase().includes(f) ||
          (s.category || "").toLowerCase().includes(f)
      );
    }

    switch (sortBy) {
      case "date-asc":
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "sales-desc":
        arr.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
        break;
      case "sales-asc":
        arr.sort((a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0));
        break;
      default: // date-desc
        arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return arr;
  }, [sales, filter, sortBy]);

  const openAddModal = () => {
    setForm(INITIAL_FORM_STATE);
    setError(null); // Clear old errors
    setProductSearchTerm(""); // **NEW:** Reset search term on open
    setModalOpen(true);
  };

  const openViewModal = (s) => setViewModal(s);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      product: form.product, // This is the _id
      unitsSold: Number(form.unitsSold),
      date: form.date,
    };

    try {
      const productDoc = products.find(p => p._id === payload.product);
      if (!productDoc) {
        throw new Error("Selected product not found. Please refresh.");
      }
      if (productDoc.stock < payload.unitsSold) {
        throw new Error(`Not enough stock. Only ${productDoc.stock} available.`);
      }

      await addSale(payload);
      setModalOpen(false);
      await fetchAll(); // Refetch products AND sales
    } catch (err) {
      setError(err.message); // Show error in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale? This will add the stock back to your inventory.")) return;
    
    setError(null);
    try {
      await deleteSale(id);
      await fetchAll(); // Refetch both sales and products
    } catch (err) {
      setError(err.message);
    }
  };

  const { todayRevenue, monthRevenue } = useMemo(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    let todayRevenue = 0;
    let monthRevenue = 0;

    (sales || []).forEach(s => {
      const d = new Date(s.date);
      if (d.toISOString().split("T")[0] === todayISO) {
        todayRevenue += (s.totalRevenue || 0);
      }
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        monthRevenue += (s.totalRevenue || 0);
      }
    });
    
    return { todayRevenue, monthRevenue };
  }, [sales]);

  const selectedProduct = products.find(p => p._id === form.product);

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Loading Sales..." />;
    }

    return (
      <div className="glass-table">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Date</th>
              <th>Units</th>
              <th>Sale Price</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleSales.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 20, textAlign: "center" }}>No sales found.</td></tr>
            ) : (
              visibleSales.map((s) => (
                <tr key={s._id}>
                  <td>{s.productName}</td>
                  <td>{s.sku}</td>
                  <td>{s.category}</td>
                  <td>{formatDate(s.date)}</td>
                  <td>{s.unitsSold}</td>
                  <td>{formatCurrency(s.salePrice)}</td>
                  <td>{formatCurrency(s.totalRevenue)}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openViewModal(s)} className="btn-success">
                        View
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="page-header">
        <h1>Sales Management</h1>
        <p>Log new sales and review sales history.</p>
      </div>
      
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Search sales by product, SKU, or category..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", flex: 1, minWidth: '200px' }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
          <option value="date-desc">Date: New → Old</option>
          <option value="date-asc">Date: Old → New</option>
          <option value="sales-desc">Revenue: High → Low</option>
          <option value="sales-asc">Revenue: Low → High</option>
        </select>
        <button onClick={openAddModal} style={{ padding: "10px 14px", borderRadius: 10 }}>
          + Add Sale
        </button>
      </div>

      {/* Revenue summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: 18 }}>
          <p style={{ margin: 0, color: "#666" }}>Today's Revenue</p>
          <h3 style={{ margin: "6px 0", color: "#b5838d" }}>
            {formatCurrency(todayRevenue)}
          </h3>
        </div>
        <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: 18 }}>
          <p style={{ margin: 0, color: "#666" }}>This Month's Revenue</p>
          <h3 style={{ margin: "6px 0", color: "#b5838d" }}>
            {formatCurrency(monthRevenue)}
          </h3>
        </div>
      </div>

      <ErrorMessage message={error && !modalOpen ? error : null} />
      
      {renderContent()}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Sale"
        width="820px"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-light" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" form="sale-form" className="btn-primary" disabled={isSubmitting || !form.product}>
              {isSubmitting ? "Saving..." : "Save Sale"}
            </button>
          </>
        }
      >
        <form id="sale-form" className="modal-form" onSubmit={submit}>
          
          {/* **NEW:** Search Input Field */}
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Search Product (by Name or SKU)</label>
            <input
              type="text"
              placeholder="Type to filter list..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
          </div>

          {/* **UPDATED:** Product Select Dropdown */}
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Select Product</label>
            <select name="product" value={form.product} onChange={handleChange} required>
              <option value="" disabled>-- Select a product --</option>
              {products
                .filter(p => p.stock > 0) // Only show in-stock items
                .filter(p => { // Filter by search term
                  if (!productSearchTerm) return true;
                  const term = productSearchTerm.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term)
                  );
                })
                .map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} (SKU: {p.sku}) - {p.stock} in stock
                  </option>
                ))}
              
              {/* Show message if search yields no results */}
              {products.filter(p => p.stock > 0).filter(p => {
                  if (!productSearchTerm) return false; // Don't show if search is empty
                  const term = productSearchTerm.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term)
                  );
                }).length === 0 && productSearchTerm && (
                  <option value="" disabled>-- No products match search --</option>
                )
              }
            </select>
          </div>

          <div className="form-field">
            <label>Units Sold</label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.stock || 1}
              name="unitsSold"
              value={form.unitsSold}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Date of Sale</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Read-only fields for confirmation */}
          <div className="form-field">
            <label>Sale Price (Read-only)</label>
            <input
              type="text"
              value={selectedProduct ? formatCurrency(selectedProduct.salePrice) : 'N/A'}
              readOnly
              style={{ background: '#f4f4f4' }}
            />
          </div>
          <div className="form-field">
            <label>Total Revenue (Calculated)</label>
            <input
              type="text"
              value={selectedProduct ? formatCurrency(selectedProduct.salePrice * Number(form.unitsSold || 0)) : 'N/A'}
              readOnly
              style={{ background: '#f4f4f4' }}
            />
          </div>
        </form>
        {/* Modal-specific error message */}
        <ErrorMessage message={error && modalOpen ? error : null} />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title={`Sale: ${viewModal?.productName || ''}`}
        width="450px"
        footer={<button onClick={() => setViewModal(null)} className="btn-primary">Close</button>}
      >
        {viewModal && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
            <strong>Product:</strong> <span>{viewModal.productName}</span>
            <strong>SKU:</strong> <span>{viewModal.sku}</span>
            <strong>Category:</strong> <span>{viewModal.category}</span>
            <strong>Date:</strong> <span>{formatDate(viewModal.date)}</span>
            <strong>Units Sold:</strong> <span>{viewModal.unitsSold}</span>
            <strong>Sale Price:</strong> <span>{formatCurrency(viewModal.salePrice)}</span>
            <strong>Cost Price:</strong> <span>{formatCurrency(viewModal.costPrice)}</span>
            <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #ddd' }} />
            <strong>Total Revenue:</strong> <span>{formatCurrency(viewModal.totalRevenue)}</span>
            <strong>Total Cost:</strong> <span>{formatCurrency(viewModal.totalCost)}</span>
            <strong>Profit:</strong> <span style={{ fontWeight: 'bold' }}>{formatCurrency(viewModal.profit)}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Sales;