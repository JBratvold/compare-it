const { executeSQLQuery } = require('../controllers/formController');

// Function to get all tables in the database
exports.getAllTables = async (req, res) => {
  try {
    const db_url = process.env.DB_URL;
    const db_auth_token = process.env.DB_AUTH_TOKEN;

    // SQL query to fetch all table names
    const sql = `SELECT name FROM sqlite_master WHERE type='table';`;
    
    const response = await executeSQLQuery(db_url, db_auth_token, sql);
    
    // Accessing the table names correctly
    const tables = response.results[0].response.result.rows.map(row => row[0]); // Get the first item from each row
    
    res.render('categories', { tables });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).send('An error occurred while fetching tables.');
  }
};

  
  

exports.getTableData = async (req, res) => {
    const { tableName } = req.params;

    try {
        const db_url = process.env.DB_URL;
        const db_auth_token = process.env.DB_AUTH_TOKEN;

        const sql = `SELECT * FROM "${tableName}";`;
        const response = await executeSQLQuery(db_url, db_auth_token, sql);

        const rows = response.results[0].response.result.rows;
        const cols = response.results[0].response.result.cols;

        const columnNames = cols.map(col => col.name);

        const formattedData = rows.map(row => {
            const obj = {};
            columnNames.forEach((colName, index) => {
                obj[colName] = row[index].value; // Ensure we're accessing the value
            });
            return obj;
        });

        const frequencyData = {};
        columnNames.slice(3).forEach(colName => {
            frequencyData[colName] = 0; // Initialize frequency counts
        });

        formattedData.forEach(row => {
            columnNames.slice(3).forEach(colName => {
                frequencyData[colName] += row[colName] || 0; // Count frequency
            });
        });

        res.render('tableData', { tableName, data: formattedData, frequencyData });
    } catch (err) {
        console.error('Error fetching table data:', err);
        res.status(500).send('An error occurred while fetching table data.');
    }
};


// In dbController.js

// Function to check if a table exists
exports.checkTableExists = async (req, res) => {
    const category = req.query.category;
    const db_url = process.env.DB_URL;
    const db_auth_token = process.env.DB_AUTH_TOKEN;

    // Query to check if the table exists
    const checkQuery = `
        SELECT name FROM sqlite_master WHERE type='table' AND name='${category}';
    `;

    try {
        const response = await executeSQLQuery(db_url, db_auth_token, checkQuery);
        const tableExists = response.results[0].response.result.rows.length > 0;

        // Send back a JSON response indicating if the table exists
        res.json(tableExists);
    } catch (err) {
        console.error('Error checking table existence:', err);
        res.status(500).send('An error occurred while checking table existence.');
    }
};


// dbController.js
exports.getPlayData = async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const db_url = process.env.DB_URL;
        const db_auth_token = process.env.DB_AUTH_TOKEN;

        // Query to get the prompt and all columns (excluding id, Prompt, Creator)
        const getPromptAndColumnsQuery = `SELECT "Prompt", * FROM "${tableName}";`;
        const response = await executeSQLQuery(db_url, db_auth_token, getPromptAndColumnsQuery);
        
        // Log the response for debugging
        const rows = response.results[0].response.result.rows;

        // Fetch prompt from the first row, assuming it is in the first column
        const prompt = rows.length > 0 && rows[0][0].value !== undefined ? rows[0][0].value : "No prompt available."; // Accessing the first column's value

        // Filter to get item columns only
        const columns = response.results[0].response.result.cols
            .filter(col => col.name !== 'id' && col.name !== 'Prompt' && col.name !== 'Creator')
            .map(col => col.name);

        // Pass the prompt and column data (items) to the play.ejs view
        res.render('play', { tableName, prompt, columns });
 
    } catch (err) {
        console.error('Error fetching play data:', err);
        res.status(500).send('An error occurred while loading the comparison page.');
    }
};





// Function to increment item value in the database
exports.incrementItemValue = async (req, res) => {
    const { tableName: encodedTableName, item } = req.body; // Get encoded tableName from req.body
    const tableName = decodeURIComponent(encodedTableName); // Decode the table name
    const db_url = process.env.DB_URL;
    const db_auth_token = process.env.DB_AUTH_TOKEN;

    try {
        // Generate the UPDATE query
        const updateQuery = `UPDATE "${tableName}" SET "${item}" = "${item}" + 1;`;
        
        // Execute the update query
        const response = await executeSQLQuery(db_url, db_auth_token, updateQuery);

        // Check for errors in the response
        if (response.results && response.results.some(result => result.type === 'error')) {
            throw new Error('Error updating item value: ' + JSON.stringify(response.results));
        }

        // Send a success response
        res.json({ success: true });
    } catch (err) {
        console.error('Error incrementing item value:', err);
        res.status(500).send('An error occurred while incrementing the item value.');
    }
};



