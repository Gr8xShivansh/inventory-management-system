#  Cosmetics Inventory Management System

A full-stack (MERN) inventory management system built with React, Node.js, Express, and MongoDB. This application allows for robust tracking of products, sales, stock levels, and expiry dates.

## ✨ Features

* **Full-Stack Integration:** A modern React frontend seamlessly integrated with a powerful Node.js & Express.js backend API.
* **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for all products.
* **Sales Tracking:** Record new sales and review a complete history of all transactions.
* **Smart Stock Synchronization:**
    * Creating a sale automatically **deducts** the correct quantity from the product's stock.
    * Deleting a sale automatically **replenishes** the stock, ensuring data integrity.
* **Advanced Dashboard:**
    * Calculates key metrics like **Total Revenue** and **Total Profit**.
    * Visualizes sales over time with a line chart.
    * Displays a pie chart of sales distribution by category.
    * Lists all **Low Stock** products.
* **Expiry Alerts:** A dedicated dashboard table shows all **Expired** and **Near-Expiry** products, sorted by urgency (most expired items first).
* **Search Functionality:**
    * The Products page can be searched by Name, SKU, or Category.
    * The "Add Sale" modal features a live search to instantly filter the product dropdown.

## 🛠 Tech Stack

* **Frontend:** React.js, React Router, Recharts, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB

## 🚀 Getting Started

To run this project on a new machine, you will need to have **Node.js** and **MongoDB** installed.

### 1. Download the Project

Clone the repository from GitHub:
```bash
git clone [https://github.com/Gr8xShivansh/inventory-management-system.git](https://github.com/Gr8xShivansh/inventory-management-system.git)
cd inventory-management-system
2. Backend Setup (Terminal 1)
Navigate to the backend folder:
cd backend
Install all required packages:
npm install
Create a .env file in the /backend folder. This file is critical for connecting to the database.
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/test
NODE_ENV=development
Start the backend server:
npm run dev
The server will be running on http://localhost:5000.

3. Frontend Setup (Terminal 2)
Open a new, separate terminal.

Navigate to the frontend folder from the project's root:
cd cosmetics-inventory-system
Install all required packages:
npm install
npm start
Start the frontend React app:
npm start
The application will automatically open in your browser at http://localhost:3000.



























