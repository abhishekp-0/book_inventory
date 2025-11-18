import {Router} from "express"
import { deleteBookById, getAllBooks, getBookById, renderForm, createBook, renderUpdateBookForm, updateBookById } from "../controllers/bookController.js";
const bookRouter=Router();

bookRouter.get("/",getAllBooks);

bookRouter.get("/new",renderForm);

bookRouter.post("/new",createBook);

bookRouter.get("/:bookId", getBookById);

bookRouter.get("/:bookId/update",renderUpdateBookForm);

bookRouter.post("/:bookId/update",updateBookById);

bookRouter.post("/:bookId/delete",deleteBookById);

export default bookRouter;