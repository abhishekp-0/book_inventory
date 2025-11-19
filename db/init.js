import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const sql=`
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS books (
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
);`;

async function main() {
    console.log("Creating tables and seeding data...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "books_inventory",
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true,
    });

    // Create tables
    await connection.query(sql);
    console.log("Tables created!");

    // Categories to seed
    const categoriesData = [
        ["Fiction", "Fictional stories and novels"],
        ["Science", "Science and technology books"],
        ["History", "Historical books and biographies"],
        ["Self-Help", "Personal development and self-improvement"],
        ["Programming", "Software development and coding books"],
    ];

    // Books to seed with category names (resolved to IDs below)
    const booksWithCategoryNames = [
        ["The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565", "A classic American novel set in the Jazz Age", 12.99, 15, "Fiction"],
        ["To Kill a Mockingbird", "Harper Lee", "978-0061120084", "A gripping tale of racial injustice and childhood innocence", 14.99, 20, "Fiction"],
        ["1984", "George Orwell", "978-0451524935", "A dystopian social science fiction novel", 13.99, 25, "Fiction"],
        ["A Brief History of Time", "Stephen Hawking", "978-0553380163", "A landmark volume in science writing", 18.99, 10, "Science"],
        ["Cosmos", "Carl Sagan", "978-0345331359", "A journey through space and time", 16.99, 12, "Science"],
        ["Sapiens", "Yuval Noah Harari", "978-0062316110", "A brief history of humankind", 19.99, 30, "History"],
        ["The Diary of a Young Girl", "Anne Frank", "978-0553296983", "The writings of a young Jewish girl during the Holocaust", 11.99, 18, "History"],
        ["Atomic Habits", "James Clear", "978-0735211292", "An easy and proven way to build good habits", 16.99, 40, "Self-Help"],
        ["The 7 Habits of Highly Effective People", "Stephen Covey", "978-1982137274", "Powerful lessons in personal change", 17.99, 35, "Self-Help"],
        ["Clean Code", "Robert C. Martin", "978-0132350884", "A handbook of agile software craftsmanship", 42.99, 22, "Programming"],
        ["The Pragmatic Programmer", "Andrew Hunt", "978-0135957059", "Your journey to mastery", 45.99, 18, "Programming"],
        ["JavaScript: The Good Parts", "Douglas Crockford", "978-0596517748", "Unearthing the excellence in JavaScript", 29.99, 25, "Programming"],
    ];

    await connection.beginTransaction();
    try {
        // Insert categories (no-op if they already exist)
        await connection.query(
            "INSERT INTO categories (name, description) VALUES ? ON DUPLICATE KEY UPDATE name = name",
            [categoriesData]
        );

        // Fetch IDs by category name
        const categoryNames = categoriesData.map(([name]) => name);
        const [categoryRows] = await connection.query(
            "SELECT id, name FROM categories WHERE name IN (?)",
            [categoryNames]
        );

        const idByName = Object.fromEntries(categoryRows.map((r) => [r.name, r.id]));

        // Build books data with resolved category IDs
        const booksData = booksWithCategoryNames.map(([title, author, isbn, description, price, stock, catName]) => [
            title,
            author,
            isbn,
            description,
            price,
            stock,
            idByName[catName],
        ]);

        // Guard: ensure all category names resolved
        if (booksData.some((b) => b[6] == null)) {
            throw new Error("One or more category names could not be resolved to IDs.");
        }

        // Insert books; on duplicate, no-op
        await connection.query(
            "INSERT INTO books (title, author, isbn, description, price, stock, category_id) VALUES ? ON DUPLICATE KEY UPDATE title = title",
            [booksData]
        );

        await connection.commit();
        console.log("Data seeded successfully!");
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        await connection.end();
    }
}

main().catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
});