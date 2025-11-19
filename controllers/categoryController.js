import * as db from "../db/query.js";
import {body, validationResult, matchedData} from "express-validator";

const links=[
  {href:"/",text:"Home"},
  {href:"/category",text:"Genres"},
  {href:"/book",text:"Books"}
];

const alphaErr = "must only contain letters and spaces.";
const lengthErr = "must be between 1 and 50 characters.";

const validateCategory = [
    body("categoryName").trim()
        .notEmpty().withMessage("Genre name is required.")
        .isLength({min:1, max:255}).withMessage("Genre name must be between 1 and 255 characters.")
        .matches(/^[a-zA-Z\s\-]+$/).withMessage(`Genre name ${alphaErr}`),
    body("description").optional({values: "falsy"}).trim()
        .isLength({max:1000}).withMessage("Description must not exceed 1000 characters.")
];

export async function getAllCategories(req, res, next) {
    try {
        const categories = await db.getAllCategories();
        res.render("categories", { categories: categories, links: links });
    } catch (error) {
        next(error);
    }
}

export async function getCategoryById(req, res, next) {
    const { categoryId } = req.params;

    try {
        const category = await db.getCategoryById(Number(categoryId));
        
        if (!category) {
            const error = new Error("Genre not found");
            error.statusCode = 404;
            return next(error);
        }
        
        const categoryBooks = await db.getBooksByCategoryId(Number(categoryId));
    
        res.render("categoryDetail", {
            category: category, 
            books: categoryBooks,
            links: links
        });
    } catch (error) {
        next(error);
    }
}

export async function renderCategoryForm(req, res, next) {
    try {
        res.render("categoryForm", {
            title: "Add New Genre",
            links: links,
            category: null
        });
    } catch (error) {
        next(error);
    }
}

export const createCategory = [
    validateCategory,
    async (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).render("categoryForm", {
                title: "Add New Genre",
                errors: errors.array(),
                links: links,
                category: req.body
            });
        }
        
        const {categoryName, description} = matchedData(req);
        
        try {
            await db.createCategory(categoryName, description);
            res.redirect("/category");
        } catch (error) {
            next(error);
        }
    }
];

export async function renderUpdateCategoryForm(req, res, next) {
    const { categoryId } = req.params;

    try {
        const category = await db.getCategoryById(Number(categoryId));

        if (!category) {
            const error = new Error("Genre not found");
            error.statusCode = 404;
            return next(error);
        }

        res.render("updateCategoryForm", {
            title: "Update Genre",
            category: category,
            links: links,
        });
    } catch (error) {
        next(error);
    }
}

export const updateCategoryById = [
    validateCategory,
    async (req, res, next) => {
        const { categoryId } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            try {
                const category = await db.getCategoryById(Number(categoryId));
                return res.status(400).render("updateCategoryForm", {
                    title: "Update Genre",
                    category: {...category, ...req.body},
                    errors: errors.array(),
                    links: links,
                });
            } catch (error) {
                return next(error);
            }
        }

        const { categoryName, description } = matchedData(req);

        try {
            const updatedCategory = await db.updateCategoryById(Number(categoryId), categoryName, description);

            if (!updatedCategory) {
                const error = new Error("Genre not found");
                error.statusCode = 404;
                return next(error);
            }

            res.redirect("/category");
        } catch (error) {
            next(error);
        }
    }
];

export async function deleteCategoryById(req, res, next) {
    const { categoryId } = req.params;
    
    try {
        const deletedCategory = await db.deleteCategoryById(Number(categoryId));
        
        if (!deletedCategory) {
            const error = new Error("Genre not found");
            error.statusCode = 404;
            return next(error);
        }
        
        res.redirect("/category");
    } catch (error) {
        next(error);
    }
}