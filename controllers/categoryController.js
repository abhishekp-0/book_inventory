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

export async function getAllCategories(req, res) {
  const categories = await db.getAllCategories();
  res.render("categories",{categories:categories,links:links});
}

export async function getCategoryById(req,res) {
    const { categoryId } = req.params;

    try {
        const category = await db.getCategoryById(Number(categoryId));
        const categoryBooks = await db.getBooksByCategoryId(Number(categoryId));
    
        if (!category) {
            res.status(404).send("Genre not found");
            return;
        }
    
        res.render("categoryDetail", {
            category: category, 
            books: categoryBooks,
            links: links
        });
    } catch (error) {
        console.error("Error retrieving Genre:",error);
        res.status(500).send("Internal Server Error");
    }
}

export async function renderCategoryForm(req,res) {
    res.render("categoryForm", {
        title: "Add New Genre",
        links: links,
        category: null
    });
}

export const createCategory = [
    validateCategory,
    async (req, res) => {
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
            console.error("Error creating Genre:",error);
            res.status(500).render("categoryForm", {
                title: "Add New Genre",
                errors: [{msg: "Database error: " + error.message}],
                links: links,
                category: req.body
            });
        }
    }
];

export async function renderUpdateCategoryForm(req, res) {
    const { categoryId } = req.params;

    try {
        const category = await db.getCategoryById(Number(categoryId));

        if (!category) {
            res.status(404).send("Genre not found");
            return;
        }

        res.render("updateCategoryForm", {
            title: "Update Genre",
            category: category,
            links: links,
        });
    } catch (error) {
        console.error("Error retrieving Genre:", error);
        res.status(500).send("Internal Server Error");
    }
}

export const updateCategoryById = [
    validateCategory,
    async (req, res) => {
        const { categoryId } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const category = await db.getCategoryById(Number(categoryId));
            return res.status(400).render("updateCategoryForm", {
                title: "Update Genre",
                category: {...category, ...req.body},
                errors: errors.array(),
                links: links,
            });
        }

        const { categoryName, description } = matchedData(req);

        try {
            const updatedCategory = await db.updateCategoryById(Number(categoryId), categoryName, description);

            if (!updatedCategory) {
                res.status(404).send("Genre not found");
                return;
            }

            res.redirect("/category");
        } catch (error) {
            console.error("Error updating Genre:", error);
            const category = await db.getCategoryById(Number(categoryId));
            res.status(500).render("updateCategoryForm", {
                title: "Update Genre",
                category: {...category, ...req.body},
                errors: [{msg: "Database error: " + error.message}],
                links: links,
            });
        }
    }
];

export async function deleteCategoryById(req,res) {
    const {categoryId}=req.params;
    
    try {
        const deletedCategory = await db.deleteCategoryById(Number(categoryId));
        
        if (!deletedCategory) {
            res.status(404).send("Genre not found");
            return;
        }
        
        res.redirect("/category");
    } catch (error) {
        console.error("Error deleting Genre:", error);
        
        // Check if error is due to foreign key constraint
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).send("Cannot delete genre: Books are still assigned to this genre.");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
}