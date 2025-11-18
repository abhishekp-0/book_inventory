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

const seedData = `
INSERT INTO categories (name, description) VALUES
('Fiction', 'Fictional stories and novels'),
('Science', 'Science and technology books'),
('History', 'Historical books and biographies'),
('Self-Help', 'Personal development and self-improvement'),
('Programming', 'Software development and coding books')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO books (title, author, isbn, description, price, stock, category_id) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'A classic American novel set in the Jazz Age', 12.99, 15, 1),
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'A gripping tale of racial injustice and childhood innocence', 14.99, 20, 1),
('1984', 'George Orwell', '978-0451524935', 'A dystopian social science fiction novel', 13.99, 25, 1),
('A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'A landmark volume in science writing', 18.99, 10, 2),
('Cosmos', 'Carl Sagan', '978-0345331359', 'A journey through space and time', 16.99, 12, 2),
('Sapiens', 'Yuval Noah Harari', '978-0062316110', 'A brief history of humankind', 19.99, 30, 3),
('The Diary of a Young Girl', 'Anne Frank', '978-0553296983', 'The writings of a young Jewish girl during the Holocaust', 11.99, 18, 3),
('Atomic Habits', 'James Clear', '978-0735211292', 'An easy and proven way to build good habits', 16.99, 40, 4),
('The 7 Habits of Highly Effective People', 'Stephen Covey', '978-1982137274', 'Powerful lessons in personal change', 17.99, 35, 4),
('Clean Code', 'Robert C. Martin', '978-0132350884', 'A handbook of agile software craftsmanship', 42.99, 22, 5),
('The Pragmatic Programmer', 'Andrew Hunt', '978-0135957059', 'Your journey to mastery', 45.99, 18, 5),
('JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'Unearthing the excellence in JavaScript', 29.99, 25, 5)
ON DUPLICATE KEY UPDATE title=title;
`;

async function main(){
    console.log("Creating tables and seeding data...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "books_inventory",
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true
    });

    await connection.query(sql);
    console.log("Tables created!");
    
    await connection.query(seedData);
    console.log("Data seeded successfully!");
    
    await connection.end();
}

main().catch(err => {
    console.error("Error seeding database:", err);
    process.exit(1);
});