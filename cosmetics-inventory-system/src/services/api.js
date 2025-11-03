// /client/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Add an interceptor to handle errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return a consistent error message
    const message = (error.response && error.response.data && error.response.data.message)
      || error.message
      || error.toString();
    return Promise.reject(new Error(message));
  }
);


// --- Dashboard ---
export const getDashboardData = () => API.get("/dashboard");

// --- Products ---
export const getProducts = () => API.get("/products");
export const addProduct = (product) => API.post("/products", product);
export const updateProduct = (id, product) => API.put(`/products/${id}`, product);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// --- Sales ---
export const getSales = () => API.get("/sales");
export const addSale = (data) => API.post("/sales", data);
export const deleteSale = (id) => API.delete(`/sales/${id}`);