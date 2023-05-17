const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const ejs = require('ejs');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'RDBMS@2023',
  database: 'product'
});

// Render the Category Master page
app.get('/categories', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
    }

    // Query the categories from the database
    connection.query('SELECT * FROM categories', (err, categories) => {
      connection.release();
      if (err) {
        throw err;
      }

      // Render the categories page with the retrieved categories
      res.render('categories', { categories });
    });
  });
});

// Render the Product Master page
app.get('/products', (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 10;

  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
    }

    // Query the total number of products
    connection.query('SELECT COUNT(*) AS totalCount FROM products', (err, result) => {
      if (err) {
        connection.release();
        throw err;
      }

      const totalCount = result[0].totalCount;
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      // Query the products for the current page
      connection.query('SELECT p.productId, p.productName, c.categoryId, c.categoryName FROM products p JOIN categories c ON p.categoryId = c.categoryId LIMIT ? OFFSET ?',
        [itemsPerPage, (currentPage - 1) * itemsPerPage], (err, products) => {
          connection.release();
          if (err) {
            throw err;
          }

          // Render the products page with the retrieved products and pagination information
          res.render('products', { products, currentPage, totalPages });
        });
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
