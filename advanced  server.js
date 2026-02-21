const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const SECRET = "hungerbyte_secret";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YOUR_PASSWORD",
  database: "hungerbyte"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, password],
    (err) => {
      if (err) return res.send("Error");
      res.send("Registered");
    });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (results.length > 0) {
        const token = jwt.sign({ id: results[0].id }, SECRET);
        res.json({ token, user: results[0] });
      } else {
        res.send("Invalid");
      }
    });
});

// GET PRODUCTS
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    res.json(results);
  });
});

// ADD TO CART
app.post("/add-cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  db.query("INSERT INTO cart (user_id,product_id,quantity) VALUES (?,?,?)",
    [user_id, product_id, quantity],
    () => {
      res.send("Added to Cart");
    });
});

// VIEW CART
app.get("/cart/:user_id", (req, res) => {
  db.query(
    "SELECT products.name, products.price, cart.quantity FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id=?",
    [req.params.user_id],
    (err, results) => {
      res.json(results);
    }
  );
});

// PLACE ORDER
app.post("/order", (req, res) => {
  const { user_id, total } = req.body;
  db.query("INSERT INTO orders (user_id,total) VALUES (?,?)",
    [user_id, total],
    () => {
      db.query("DELETE FROM cart WHERE user_id=?", [user_id]);
      res.send("Order Placed");
    });
});

// ORDER HISTORY
app.get("/orders/:user_id", (req, res) => {
  db.query("SELECT * FROM orders WHERE user_id=?",
    [req.params.user_id],
    (err, results) => {
      res.json(results);
    });
});

// ADMIN ADD PRODUCT
app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;
  db.query("INSERT INTO products (name,price,image) VALUES (?,?,?)",
    [name, price, image],
    () => {
      res.send("Product Added");
    });
});

app.listen(5000, () => {
  console.log("Server Running on 5000");
});
