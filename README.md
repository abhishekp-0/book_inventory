# 📚 Books Inventory Management System

A full-stack CRUD application for managing books and genres, built with Node.js, Express, MySQL, and EJS.
This project demonstrates clean server-side architecture, modular controllers, structured validation, and a production-aware configuration pattern suitable for small to mid-scale web applications.

## Overview

The system provides:

- End-to-end CRUD for books and genres
- Server-side validation using express-validator
- MySQL connection pooling for efficiency and reliability
- Tailwind-powered UI with accessible, semantic components
- Centralized logging and error-handling
- Clear separation of concerns across routes, controllers, DB helpers, and views

This project highlights practical full-stack engineering patterns without framework abstraction—ideal for demonstrating core backend fundamentals.

## Tech Stack

- **Backend**: Node.js, Express.js v5
- **Database**: MySQL 8.0 (mysql2/promise)
- **Templating**: EJS
- **Styling**: Tailwind CSS (CDN)
- **Validation**: express-validator
- **Logging**: Winston + Morgan

## Core Architecture

The application follows a straightforward, maintainable structure:

```
Books_Inventory/
├── config/            # Logging configuration
├── controllers/       # Business logic and validation handlers
├── db/                # Connection pool, queries, and seed script
├── routes/            # Route definitions for books and categories
├── views/             # EJS templates (pages + partials)
├── public/            # Static assets
├── logs/              # Application logs (auto-generated)
├── app.js             # Application initialization and middleware
└── package.json       # Project dependencies
```

**Key architectural decisions:**

- **Controller-driven validation**: Input validation centralized, not embedded in routes
- **Query abstraction**: All database operations handled through a thin query layer for simplicity and readability
- **Environment-dependent behavior**: Logging verbosity, error surfaces, and configuration shift based on `NODE_ENV`
- **Seed script**: Enables deterministic database setup for local development and demonstration

## Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- MySQL 8.0 or higher
- npm or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file using the template:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your-password>
DB_NAME=books_inventory
DB_PORT=3306
DB_CONNECTION_LIMIT=10
PORT=3000
NODE_ENV=development
```

### 3. Initialize schema and seed sample data

```bash
npm run seed
```

This will:
- Create `categories` and `books` tables
- Insert 5 sample genres (Fiction, Science, History, Self-Help, Programming)
- Insert 12 sample books with realistic data

### 4. Start the development server

```bash
npm run dev
```

App runs at: **http://localhost:3000**

## Application Features

### Book Management
- Create, update, delete, and view book details
- Price and stock validation
- ISBN and uniqueness constraints
- Category assignment with relational integrity

### Genre Management
- Create/update genres with description
- View genre details with associated book list
- Prevent deletion of genres with associated books

### UI & Accessibility
- Tailwind-based responsive layout
- Shared partials for navigation and error display
- Semantic markup and ARIA attributes
- Visual stock indicators

### Reliability & Error Handling
- Centralized error middleware
- Differentiated development/production error output
- Structured logging (combined + error logs)
- Graceful handling of database connection issues

## Notable Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/book` | All books |
| `/book/new` | Create book |
| `/book/:id` | Book details |
| `/category` | All genres |
| `/category/new` | Create genre |
| `/category/:id` | Genre details with books |
| `/health` | Basic health check |

## Available Scripts

```bash
# Start production server
npm start

# Start development server (with auto-reload)
npm run dev

# Initialize/reset database with seed data
npm run seed

# Run production mode with database setup
npm run prod
```

## Database Schema

### Categories Table
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);
```

### Books Table
```sql
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    UNIQUE (title, author, category_id)
);
```

## Environment Configuration

### Development Mode (`NODE_ENV=development`)
- Detailed error messages with stack traces
- Console logging enabled
- Colorized log output
- Debug information displayed

### Production Mode (`NODE_ENV=production`)
- Generic user-friendly error messages
- File-based logging only
- Structured JSON logs
- No sensitive information exposed

## Logging System

Logs are stored in the `logs/` directory:
- `combined.log` — All logs
- `error.log` — Error logs only
- `exceptions.log` — Uncaught exceptions
- `rejections.log` — Unhandled promise rejections

View logs in real-time:
```bash
tail -f logs/combined.log
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

**Abhishek**

## Acknowledgments

- The Odin Project for project inspiration
- Express.js community for excellent documentation

---

**Need help?** Enable development mode with `NODE_ENV=development` and check logs in the `logs/` directory for detailed error information.
