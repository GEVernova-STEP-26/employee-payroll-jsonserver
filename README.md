# Employee Payroll App

A modern, responsive Single Page Application (SPA) for managing employee records. Built with Vanilla JavaScript, HTML5, CSS3, and JSON Server.

## Features

- **Dashboard**: Real-time statistics for total employees, payroll cost, and average salary.
- **CRUD Operations**: Create, Read, Update, and Delete employee records.
- **Search & Filter**: Instant search by name/email and sorting capabilities.
- **Responsive Design**: Mobile-friendly layout (CSS Flexbox/Grid).
- **Validation**: Real-time form validation with visual feedback.
- **Notifications**: Toast notification system for user feedback.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher) installed on your machine.

## Installation

1.  Navigate to the project folder:
    ```bash
    cd my-crud-app
    ```

2.  Install dependencies (JSON Server):
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the Backend Server**:
    This command starts the mock REST API server on port 3000.
    ```bash
    npm start
    ```
    
    *Note: To simulate network latency (0.5s delay), run `npm run server` instead.*

2.  **Open the Application**:
    Open `index.html` in your preferred web browser.
    
    *Recommendation: Use VS Code's "Live Server" extension for the best experience.*

## Project Structure

```
my-crud-app/
├── db.json                 # Mock database
├── package.json            # Project configuration
├── index.html              # Main application file
├── css/
│   └── style.css           # Styling
└── js/
    ├── api.js              # API Service layer
    └── script.js           # Application logic
```

## Technologies Used

- **Frontend**: HTML5, CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+).
- **Backend**: JSON Server (Mock REST API).
- **Icons**: Font Awesome 6.
- **Fonts**: Google Fonts (Roboto).
# employee-payroll-jsonserver
