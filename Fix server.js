const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

const WA_NUMBER = process.env.WA_NUMBER || "2348166545358";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

const db = new Database(process.env.DB_FILE || "data.sqlite");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const count = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;

if (count === 0) {
  const add = db.prepare(
    "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)"
  );

  add.run("Dangote 3X Cement", "Cement", 0, 0);
  add.run("Dangote Block Master", "Cement", 0, 0);
  add.run("BUA POP Cement", "Cement", 0, 0);
  add.run("Iron Rod 8mm", "Iron Rods", 0, 0);
  add.run("Iron Rod 10mm", "Iron Rods", 0, 0);
  add.run("Iron Rod 12mm", "Iron Rods", 0, 0);
  add.run("Iron Rod 16mm", "Iron Rods", 0, 0);
  add.run("Ceramic Tiles 60x60", "Tiles", 0, 0);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/products", (req, res) => {
  const products = db
    .prepare("SELECT * FROM products ORDER BY category, name")
    .all();

  res.json(products);
});

app.post("/api/orders", (req, res) => {
  const { customer, phone, address, items, total } = req.body;

  if (!customer || !phone || !address || !items || !total) {
    return res.status(400).json({
      error: "Please provide customer, phone, address, items and total."
    });
  }

  const result = db.prepare(`
    INSERT INTO orders
    (customer, phone, address, items, total)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    customer,
    phone,
    address,
    JSON.stringify(items),
   
