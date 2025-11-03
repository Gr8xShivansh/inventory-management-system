// src/pages/Products.js
import React, { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

// Helper to format date for input[type=date]
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const INITIAL_FORM_STATE = {
  sku: "",
  name: "",
  category: "",
  stock: "0",
  costPrice: "0",
  salePrice: "0",
  lowStockAlert: "10",
  highStockAlert: "100",
  reorderQuantity: "20",
  manufacturingDate: "",
  expiryDate: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleProducts = useMemo(() => {
    let arr = [...products];
    if (filter.trim() !== "") {
      const f = filter.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(f) ||
          p.sku.toLowerCase().includes(f) ||
          p.category.toLowerCase().includes(f)
      );
    }

    switch (sortBy) {
      case "az":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "stock-asc":
        arr.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        arr.sort((a, b) => b.stock - a.stock);
        break;
      default: // newest
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return arr;
  }, [products, filter, sortBy]);

  const openAddModal = () => {
    setEditId(null);
    setForm(INITIAL_FORM_STATE);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditId(product._id);
    setForm({
      sku: product.sku ?? "",
      name: product.name ?? "",
      category: product.category ?? "",
      stock: product.stock?.toString() ?? "0",
      costPrice: product.costPrice?.toString() ?? "0",
      salePrice: product.salePrice?.toString() ?? "0",
      lowStockAlert: product.lowStockAlert?.toString() ?? "10",
      highStockAlert: product.highStockAlert?.toString() ?? "100",
      reorderQuantity: product.reorderQuantity?.toString() ?? "20",
      manufacturingDate: formatDateForInput(product.manufacturingDate),
      expiryDate: formatDateForInput(product.expiryDate),
    });
    setError(null);
    setModalOpen(true);
  };

  const openViewModal = (product) => {
    setViewProduct(product);
    setViewModalOpen(true);
  };

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const payload = {
      ...form,
      stock: Number(form.stock || 0),
      costPrice: Number(form.costPrice || 0),
      salePrice: Number(form.salePrice || 0),
      lowStockAlert: Number(form.lowStockAlert || 10),
      highStockAlert: Number(form.highStockAlert || 100),
      reorderQuantity: Number(form.reorderQuantity || 20),
      manufacturingDate: form.manufacturingDate || undefined,
      expiryDate: form.expiryDate || undefined,
    };
    
    try {
      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await addProduct(payload);
      }
      await fetchProducts(); // Refetch all data
      setModalOpen(false);
    } catch (err) {
      setError(err.message); // Show error in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      await fetchProducts(); // Refetch
    } catch (err) {
      setError(err.message);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Loading Products..." />;
    }
    
    if (visibleProducts.length === 0 && !filter) {
      return <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>No products found.</h2>
        <button onClick={openAddModal}>+ Add Your First Product</button>
      </div>;
    }

    return (
      <div className="glass-table">
        <table className="styled-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Sale Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center" }}>No products match your search.</td></tr>
            )}
            {visibleProducts.map((p) => (
              <tr key={p._id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>₹{p.salePrice}</td>
                <td>
                  {p.stock === 0 ? (
                    <span className="status-error">Out of Stock</span>
                  ) : p.stock <= p.lowStockAlert ? (
                    <span className="status-warning">Low Stock</span>
                  ) : (
                    <span className="status-success">In Stock</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => openViewModal(p)} className="btn-success">View</button>
                    <button onClick={() => openEditModal(p)} className="btn-warning">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="page-header">
        <h1>Product Management</h1>
        <p>Add, edit, and view all products in your inventory.</p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, SKU, or category..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", flex: 1, minWidth: '200px' }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
          <option value="newest">Date: Newest</option>
          <option value="oldest">Date: Oldest</option>
          <option value="az">Name: A → Z</option>
          <option value="za">Name: Z → A</option>
          <option value="stock-asc">Stock: Low → High</option>
          <option value="stock-desc">Stock: High → Low</option>
        </select>

        <button onClick={openAddModal} style={{ padding: "10px 14px", borderRadius: 10 }}>
          + Add Product
        </button>
      </div>
      
      <ErrorMessage message={error && !modalOpen ? error : null} />

      {renderContent()}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Product" : "Add Product"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-light"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (editId ? "Update" : "Add Product")}
            </button>
          </>
        }
      >
        <form id="product-form" className="modal-form" onSubmit={submitForm}>
          {/* Explicit form fields for better UX and validation */}
          <div className="form-field">
            <label>SKU (Unique ID)</label>
            <input name="sku" value={form.sku} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Product Name</label>
            <input name="name" value={form.name} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Stock Quantity</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Cost Price (₹)</label>
            <input name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Sale Price (₹)</label>
            <input name="salePrice" type="number" min="0" step="0.01" value={form.salePrice} onChange={handleFormChange} required />
          </div>
          <div className="form-field">
            <label>Low Stock Alert Level</label>
            <input name="lowStockAlert" type="number" min="0" value={form.lowStockAlert} onChange={handleFormChange} />
          </div>
          <div className="form-field">
            <label>High Stock Alert Level</label>
            <input name="highStockAlert" type="number" min="0" value={form.highStockAlert} onChange={handleFormChange} />
          </div>
          <div className="form-field">
            <label>Re-order Quantity</label>
            <input name="reorderQuantity" type="number" min="0" value={form.reorderQuantity} onChange={handleFormChange} />
          </div>
          <div className="form-field">
            <label>Manufacturing Date</label>
            <input name="manufacturingDate" type="date" value={form.manufacturingDate} onChange={handleFormChange} />
          </div>
          <div className="form-field">
            <label>Expiry Date</label>
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleFormChange} />
          </div>
        </form>
        {/* Modal-specific error message */}
        <ErrorMessage message={error && modalOpen ? error : null} />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={viewProduct?.name || "Product Details"}
        width="600px"
        footer={<button onClick={() => setViewModalOpen(false)} className="btn-primary">Close</button>}
      >
        {viewProduct && (
          <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            <strong>SKU:</strong> <span>{viewProduct.sku}</span>
            <strong>Category:</strong> <span>{viewProduct.category}</span>
            <strong>Stock:</strong> <span>{viewProduct.stock}</span>
            <strong>Cost Price:</strong> <span>₹{viewProduct.costPrice}</span>
            <strong>Sale Price:</strong> <span>₹{viewProduct.salePrice}</span>
            <strong>Units Sold:</strong> <span>{viewProduct.unitsSold}</span>
            <strong>Low Stock Alert:</strong> <span>{viewProduct.lowStockAlert}</span>
            <strong>Expiry Date:</strong> <span>{formatDateForInput(viewProduct.expiryDate) || 'N/A'}</span>
            <strong>Created On:</strong> <span>{new Date(viewProduct.createdAt).toLocaleString()}</span>
            <strong>Last Updated:</strong> <span>{new Date(viewProduct.updatedAt).toLocaleString()}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Products;