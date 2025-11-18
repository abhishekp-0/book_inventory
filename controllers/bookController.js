import * as db from "../db/query.js";
import {body, validationResult, matchedData} from "express-validator";

const links=[
  {href:"/",text:"Home"},
  {href:"/category",text:"Genres"},
  {href:"/book",text:"Books"}
];

const validateBook = [
    body("title").trim()
        .notEmpty().withMessage("Title is required.")
        .isLength({min:1, max:255}).withMessage("Title must be between 1 and 255 characters.")
        .matches(/^[a-zA-Z0-9\s\-',.!:&]+$/).withMessage("Title contains invalid characters."),
    body("author").trim()
        .notEmpty().withMessage("Author is required.")
        .isLength({min:1, max:255}).withMessage("Author must be between 1 and 255 characters.")
        .matches(/^[a-zA-Z\s\-'.]+$/).withMessage("Author must only contain letters."),
    body("isbn").trim()
        .notEmpty().withMessage("ISBN is required.")
        .isLength({min:10, max:20}).withMessage("ISBN must be between 10 and 20 characters.")
        .matches(/^[0-9\-X]+$/).withMessage("ISBN must only contain numbers, hyphens, and X."),
    body("description").optional({values: "falsy"}).trim()
        .isLength({max:1000}).withMessage("Description must not exceed 1000 characters."),
    body("price").trim()
        .notEmpty().withMessage("Price is required.")
        .isFloat({min:0}).withMessage("Price must be a positive number."),
    body("stock").optional({values: "falsy"}).trim()
        .isInt({min:0}).withMessage("Stock must be a non-negative integer."),
    body("category_id").trim()
        .notEmpty().withMessage("Genre is required.")
        .isInt({min:1}).withMessage("Please select a valid genre.")
];

export async function getAllBooks(req,res) {
    const books = await db.getAllBooks();
    res.render("books",{books:books,links:links});
}

export async function getBookById(req,res) {
    const { bookId } = req.params;
    
    try {
        const book = await db.getBookById(Number(bookId));
    
        if (!book) {
            res.status(404).send("Book not found");
            return;
        }
    
        res.render("bookDetail", {book:book, links:links});
    } catch (error) {
        console.error("Error retrieving Book:",error);
        res.status(500).send("Internal Server Error");
    }
}

export async function renderForm(req,res) {
    const categories = await db.getAllCategories();
    res.render("form", {
        title: "Add New Book",
        links: links,
        categories: categories,
        book: null
    });
}

export const createBook = [
    validateBook,
    async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const categories = await db.getAllCategories();
            return res.status(400).render("form", {
                title: "Add New Book",
                errors: errors.array(),
                links: links,
                categories: categories,
                book: req.body
            });
        }
        
        const bookData = matchedData(req);
        
        try {
            await db.createBook(bookData);
            res.redirect("/book");
        } catch (error) {
            console.error("Error creating Book:",error);
            const categories = await db.getAllCategories();
            res.status(500).render("form", {
                title: "Add New Book",
                errors: [{msg: "Database error: " + error.message}],
                links: links,
                categories: categories,
                book: req.body
            });
        }
    }
];

export async function renderUpdateBookForm(req, res) {
    const { bookId } = req.params;

    try {
        const book = await db.getBookById(Number(bookId));
        const categories = await db.getAllCategories();

        if (!book) {
            res.status(404).send("Book not found");
            return;
        }

        res.render("updateBookForm", {
            title: "Update Book",
            book: book,
            links: links,
            categories: categories
        });
    } catch (error) {
        console.error("Error retrieving Book:", error);
        res.status(500).send("Internal Server Error");
    }
}

export const updateBookById = [
    validateBook,
    async (req, res) => {
        const { bookId } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const book = await db.getBookById(Number(bookId));
            const categories = await db.getAllCategories();
            return res.status(400).render("updateBookForm", {
                title: "Update Book",
                book: {...book, ...req.body},
                errors: errors.array(),
                links: links,
                categories: categories
            });
        }

        const bookData = matchedData(req);

        try {
            const updatedBook = await db.updateBookById(Number(bookId), bookData);

            if (!updatedBook) {
                res.status(404).send("Book not found");
                return;
            }

            res.redirect("/book");
        } catch (error) {
            console.error("Error updating Book:", error);
            const book = await db.getBookById(Number(bookId));
            const categories = await db.getAllCategories();
            res.status(500).render("updateBookForm", {
                title: "Update Book",
                book: {...book, ...req.body},
                errors: [{msg: "Database error: " + error.message}],
                links: links,
                categories: categories
            });
        }
    }
];

export async function deleteBookById(req,res) {
    const {bookId}=req.params;
    
    try {
        const deletedBook = await db.deleteBookById(Number(bookId));
        
        if (!deletedBook) {
            res.status(404).send("Book not found");
            return;
        }
        
        res.redirect("/book");
    } catch (error) {
        console.error("Error deleting Book:", error);
        res.status(500).send("Internal Server Error");
    }
}