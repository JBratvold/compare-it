# Name-Ranker Web Application

This web application allows users to compare multiple items in a pairwise fashion and helps determine which item is preferred. The application dynamically handles comparisons across different user-created categories.

A live version of the app is available here:  
[Live Demo](https://compare-it.onrender.com)

## Features

- **Dynamic Categories**: Users can create custom categories for comparisons, such as "Food", "Movies", or "Countries".
- **Pairwise Comparison**: Compare two items at a time to determine which one is preferred.
- **User-friendly Interface**: Easy navigation with clear prompts and progress tracking during comparisons.
- **Database Integration**: Powered by Turso, each user-created category is stored in a dedicated database table for real-time access and updates.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, EJS for templating
- **Database**: Turso (SQL-based)
- **Hosting**: Render

## Getting Started

### Prerequisites

To run the application locally, you need to have the following installed:

- [Node.js](https://nodejs.org/) (v12 or higher)
- [npm](https://www.npmjs.com/get-npm)
- A [Turso database](https://turso.tech) instance

### Installation

1. Clone the repository:

  ```git clone https://github.com/your-username/your-repo.git```

2. Navigate to the project director:

  ```cd your-repo```
  

3. Install dependencies:

  ```npm install```

### Configuration

1. Create a ```.env``` file in the project root with the following variables:

### Running the Application

To start the application, run:

```npm start``` or ```node app.js```

The app will be live on [http://localhost:3000](http://localhost:3000) or the port specified in your ```.env``` file.

### Deployment

#### Render

To deploy the application on Render:

1. Create a new **Web Service** on Render.
2. Set the following values:
- **Build Command**: ```npm install```
- **Start Command**: ```node app.js```
3. Set up environment variables for your Turso database (e.g., ```DB_URL```).
4. After deployment, your web service will be live at ```https://your-app.onrender.com```.