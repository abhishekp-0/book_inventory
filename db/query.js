import { pool } from "./pool.js";

// Category queries
export async function getAllCategories() {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY id");
  return rows;
}

export async function getCategoryById(categoryId) {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
  return rows[0];
}

export async function createCategory(categoryName, description = null) {
  const [result] = await pool.query(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [categoryName, description]
  );
  return { id: result.insertId, name: categoryName, description };
}

export async function updateCategoryById(id, name, description = null) {
  const [result] = await pool.query(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name, description, id]
  );
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return { id, name, description };
}

export async function deleteCategoryById(id) {
  const category = await getCategoryById(id);
  
  if (!category) {
    return null;
  }
  
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return category;
}

export async function getBooksByCategoryId(categoryId) {
  const [rows] = await pool.query(`
    SELECT books.*, categories.name as category_name 
    FROM books 
    LEFT JOIN categories ON books.category_id = categories.id 
    WHERE books.category_id = ?
    ORDER BY books.title
  `, [categoryId]);
  return rows;
}

// Book queries
export async function getAllBooks() {
  const [rows] = await pool.query(`
    SELECT books.*, categories.name as category_name 
    FROM books 
    LEFT JOIN categories ON books.category_id = categories.id 
    ORDER BY books.id
  `);
  return rows;
}

export async function getBookById(bookId) {
  const [rows] = await pool.query(`
    SELECT books.*, categories.name as category_name 
    FROM books 
    LEFT JOIN categories ON books.category_id = categories.id 
    WHERE books.id = ?
  `, [bookId]);
  return rows[0];
}

export async function createBook(bookData) {
  const { title, author, isbn, description, price, stock, category_id } = bookData;
  
  const [result] = await pool.query(
    "INSERT INTO books (title, author, isbn, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, author, isbn, description || null, price, stock || 0, category_id]
  );
  
  return { id: result.insertId, ...bookData };
}

export async function updateBookById(id, bookData) {
  const { title, author, isbn, description, price, stock, category_id } = bookData;
  
  const [result] = await pool.query(
    "UPDATE books SET title = ?, author = ?, isbn = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?",
    [title, author, isbn, description, price, stock, category_id, id]
  );
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return { id, ...bookData };
}

export async function deleteBookById(id) {
  const book = await getBookById(id);
  
  if (!book) {
    return null;
  }
  
  const [result] = await pool.query("DELETE FROM books WHERE id = ?", [id]);
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return book;
}


