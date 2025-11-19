import { pool } from "./pool.js";

// Custom error class for database operations
class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "DatabaseError";
    this.originalError = originalError;
    this.statusCode = 500;
  }
}

// Category queries
export async function getAllCategories() {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id");
    return rows;
  } catch (error) {
    throw new DatabaseError("Failed to retrieve categories", error);
  }
}

export async function getCategoryById(categoryId) {
  try {
    if (!categoryId || categoryId <= 0) {
      throw new DatabaseError("Invalid category ID provided");
    }
    
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    return rows[0];
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to retrieve category with ID ${categoryId}`, error);
  }
}

export async function createCategory(categoryName, description = null) {
  try {
    if (!categoryName || categoryName.trim() === "") {
      throw new DatabaseError("Category name is required");
    }
    
    const [result] = await pool.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [categoryName, description]
    );
    return { id: result.insertId, name: categoryName, description };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      throw new DatabaseError(`Category '${categoryName}' already exists`, error);
    }
    
    throw new DatabaseError("Failed to create category", error);
  }
}

export async function updateCategoryById(id, name, description = null) {
  try {
    if (!id || id <= 0) {
      throw new DatabaseError("Invalid category ID provided");
    }
    
    if (!name || name.trim() === "") {
      throw new DatabaseError("Category name is required");
    }
    
    const [result] = await pool.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return { id, name, description };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    
    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      throw new DatabaseError(`Category '${name}' already exists`, error);
    }
    
    throw new DatabaseError(`Failed to update category with ID ${id}`, error);
  }
}

export async function deleteCategoryById(id) {
  try {
    if (!id || id <= 0) {
      throw new DatabaseError("Invalid category ID provided");
    }
    
    const category = await getCategoryById(id);
    
    if (!category) {
      return null;
    }
    
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return category;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    
    // Handle foreign key constraint error
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new DatabaseError(
        "Cannot delete category: Books are still assigned to this category. Please reassign or delete those books first.",
        error
      );
    }
    
    throw new DatabaseError(`Failed to delete category with ID ${id}`, error);
  }
}

export async function getBooksByCategoryId(categoryId) {
  try {
    if (!categoryId || categoryId <= 0) {
      throw new DatabaseError("Invalid category ID provided");
    }
    
    const [rows] = await pool.query(`
      SELECT books.*, categories.name as category_name 
      FROM books 
      LEFT JOIN categories ON books.category_id = categories.id 
      WHERE books.category_id = ?
      ORDER BY books.title
    `, [categoryId]);
    return rows;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to retrieve books for category ID ${categoryId}`, error);
  }
}


// Book queries
export async function getAllBooks() {
  try {
    const [rows] = await pool.query(`
      SELECT books.*, categories.name as category_name 
      FROM books 
      LEFT JOIN categories ON books.category_id = categories.id 
      ORDER BY books.id
    `);
    return rows;
  } catch (error) {
    throw new DatabaseError("Failed to retrieve books", error);
  }
}

export async function getBookById(bookId) {
  try {
    if (!bookId || bookId <= 0) {
      throw new DatabaseError("Invalid book ID provided");
    }
    
    const [rows] = await pool.query(`
      SELECT books.*, categories.name as category_name 
      FROM books 
      LEFT JOIN categories ON books.category_id = categories.id 
      WHERE books.id = ?
    `, [bookId]);
    return rows[0];
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to retrieve book with ID ${bookId}`, error);
  }
}

export async function createBook(bookData) {
  try {
    if (!bookData || typeof bookData !== "object") {
      throw new DatabaseError("Invalid book data provided");
    }
    
    const { title, author, isbn, description, price, stock, category_id } = bookData;
    
    if (!title || !author || !isbn || price == null || !category_id) {
      throw new DatabaseError("Missing required book fields");
    }
    
    const [result] = await pool.query(
      "INSERT INTO books (title, author, isbn, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, author, isbn, description || null, price, stock || 0, category_id]
    );
    
    return { id: result.insertId, ...bookData };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    
    // Handle duplicate ISBN error
    if (error.code === "ER_DUP_ENTRY") {
      throw new DatabaseError(`A book with ISBN '${bookData.isbn}' already exists`, error);
    }
    
    // Handle foreign key constraint error
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new DatabaseError("Invalid category selected. Please choose a valid category.", error);
    }
    
    throw new DatabaseError("Failed to create book", error);
  }
}

export async function updateBookById(id, bookData) {
  try {
    if (!id || id <= 0) {
      throw new DatabaseError("Invalid book ID provided");
    }
    
    if (!bookData || typeof bookData !== "object") {
      throw new DatabaseError("Invalid book data provided");
    }
    
    const { title, author, isbn, description, price, stock, category_id } = bookData;
    
    if (!title || !author || !isbn || price == null || !category_id) {
      throw new DatabaseError("Missing required book fields");
    }
    
    const [result] = await pool.query(
      "UPDATE books SET title = ?, author = ?, isbn = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?",
      [title, author, isbn, description, price, stock, category_id, id]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return { id, ...bookData };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    
    // Handle duplicate ISBN error
    if (error.code === "ER_DUP_ENTRY") {
      throw new DatabaseError(`A book with ISBN '${bookData.isbn}' already exists`, error);
    }
    
    // Handle foreign key constraint error
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new DatabaseError("Invalid category selected. Please choose a valid category.", error);
    }
    
    throw new DatabaseError(`Failed to update book with ID ${id}`, error);
  }
}

export async function deleteBookById(id) {
  try {
    if (!id || id <= 0) {
      throw new DatabaseError("Invalid book ID provided");
    }
    
    const book = await getBookById(id);
    
    if (!book) {
      return null;
    }
    
    const [result] = await pool.query("DELETE FROM books WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return book;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to delete book with ID ${id}`, error);
  }
}

