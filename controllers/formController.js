// Helper function to generate the CREATE TABLE query
const generateCreateTableQuery = (category, items) => {
    return `
      CREATE TABLE IF NOT EXISTS "${category}" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Prompt TEXT,
        Creator TEXT,
        ${items.map(item => `"${item}" INTEGER DEFAULT 0`).join(', ')}
      );
    `.trim();
  };
  
  // Helper function to generate the INSERT query
  const generateInsertQuery = (prompt, creator, category, items) => {
    return `
      INSERT INTO "${category}" (Prompt, Creator${items.length > 0 ? `, ${items.map(item => `"${item}"`).join(', ')}` : ''})
      VALUES ("${prompt}", "${creator}", ${items.map(() => '0').join(', ')});
    `.trim();
  };
  
  // Helper function to execute SQL queries
  const executeSQLQuery = async (db_url, db_auth_token, sql, params = []) => {
    const response = await fetch(db_url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${db_auth_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql, params } }],
      }),
    });
    return response.json();
  };
  
  // Main form submission handler
exports.submitForm = async (req, res) => {
  try {
      const { category, prompt, creator, items = [] } = req.body;

      // Check if items is empty and set to default
      const finalItems = items.length > 0 ? items : ['NoItems'];

      const db_url = process.env.DB_URL;
      const db_auth_token = process.env.DB_AUTH_TOKEN;

      // Generate the CREATE TABLE query
      const createTableQuery = generateCreateTableQuery(category, finalItems);

      // Execute the CREATE TABLE query
      const createTableResponse = await executeSQLQuery(db_url, db_auth_token, createTableQuery);

      // Check for errors in the table creation response
      if (createTableResponse.results && createTableResponse.results.some(result => result.type === 'error')) {
          throw new Error('Error creating table.');
      }

      // Generate the INSERT query
      const insertDataQuery = generateInsertQuery(prompt, creator, category, finalItems);

      // Prepare params for insertion
      const params = [prompt, creator, ...finalItems.map(() => 0)];

      // Execute the INSERT query
      const insertDataResponse = await executeSQLQuery(db_url, db_auth_token, insertDataQuery, params);

      // Check for errors in the insertion response
      if (insertDataResponse.results && insertDataResponse.results.some(result => result.type === 'error')) {
          throw new Error('Error inserting data.');
      }

      // Redirect to index with a success message
      res.redirect('/?message=Category created successfully!');

  } catch (err) {
      console.error('Error:', err);
      res.status(500).send('An error occurred.');
  }
};


  exports.deleteCategory = async (req, res) => {
    const category = req.params.category;
    const password = req.body.password; // Get the password from the request body
    const db_url = process.env.DB_URL;
    const db_auth_token = process.env.DB_AUTH_TOKEN;

    // Check if the password is correct
    if (password !== process.env.PASSWORD) {
        return res.status(403).send('Incorrect password.');
    }

    // Generate the DROP TABLE query
    const dropTableQuery = `DROP TABLE IF EXISTS "${category}";`;

    try {
        const deleteResponse = await executeSQLQuery(db_url, db_auth_token, dropTableQuery);

        // Check for errors in the deletion response
        if (deleteResponse.results && deleteResponse.results.some(result => result.type === 'error')) {
            throw new Error('Error deleting table.');
        }

        // Redirect to categories page with a success message
        res.redirect('/categories?message=Category deleted successfully.');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred while deleting the category.');
    }
};


// Reset all item columns in a category (table) to 0
exports.resetCategory = async (req, res) => {
  const category = req.params.category;
  const password = req.body.password; // Get the password from the request body
  const db_url = process.env.DB_URL;
  const db_auth_token = process.env.DB_AUTH_TOKEN;

  // Check if the password is correct
  if (password !== process.env.PASSWORD) {
      return res.status(403).send('Incorrect password.');
  }

  try {
      // Get the list of columns for the table
      const getColumnsQuery = `PRAGMA table_info("${category}");`;
      const columnsResponse = await executeSQLQuery(db_url, db_auth_token, getColumnsQuery);

      // Access the rows array from the response
      const columns = columnsResponse.results[0].response.result.rows;

      // Filter out non-item columns (like 'id', 'Prompt', and 'Creator')
      const itemColumns = columns
          .filter(row => row[1].value !== 'id' && row[1].value !== 'Prompt' && row[1].value !== 'Creator')
          .map(row => row[1].value); // Get column names from the second item in each row

      if (itemColumns.length === 0) {
          return res.status(400).send('No item columns found to reset.');
      }

      // Generate the UPDATE query to reset all item columns to 0
      const resetQuery = `
          UPDATE "${category}"
          SET ${itemColumns.map(column => `"${column}" = 0`).join(', ')};
      `;

      // Execute the reset query
      const resetResponse = await executeSQLQuery(db_url, db_auth_token, resetQuery);

      // Check for errors in the reset response
      if (resetResponse.results && resetResponse.results.some(result => result.type === 'error')) {
          throw new Error('Error resetting table.');
      }

      // Redirect to categories page with a success message
      res.redirect(`/categories/${category}?message=Category reset successfully.`);
  } catch (err) {
      console.error('Error:', err);
      res.status(500).send('An error occurred while resetting the category.');
  }
};



  
  // Export the executeSQLQuery function
  module.exports.executeSQLQuery = executeSQLQuery;
  