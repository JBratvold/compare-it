const express = require('express');
const path = require('path');
const router = express.Router();
const formController = require('../controllers/formController');
const dbController = require('../controllers/dbController'); // New controller for database routes

// GET Routes
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/name-comparison', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/name-comparison.html'));
});

router.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/form.html'));
});

// Get all tables in the database
router.get('/categories', dbController.getAllTables);

// Get a specific table's data
router.get('/categories/:tableName', dbController.getTableData);

// POST Routes
router.post('/submitted', formController.submitForm);

// Add this delete route
router.post('/delete/:category', formController.deleteCategory);

// Add this reset route
router.post('/reset/:category', formController.resetCategory);

// Add this route to check if the table exists
router.get('/check-table-exists', dbController.checkTableExists);


// Catch-all 404 route
router.use((req, res) => {
  res.status(404).send('Error 404. Page is non-existent.');
});

module.exports = router;
