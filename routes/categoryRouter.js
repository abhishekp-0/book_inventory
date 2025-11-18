//do similar things here for categoryRouter like in bookRouter
import {Router} from "express";
import { getAllCategories,getCategoryById,renderCategoryForm,createCategory,renderUpdateCategoryForm,updateCategoryById,deleteCategoryById } from "../controllers/categoryController.js";

const categoryRouter=Router();

categoryRouter.get("/",getAllCategories);

categoryRouter.get("/new",renderCategoryForm);

categoryRouter.post("/new",createCategory);

categoryRouter.get("/:categoryId", getCategoryById);

categoryRouter.get("/:categoryId/update",renderUpdateCategoryForm);

categoryRouter.post("/:categoryId/update",updateCategoryById);

categoryRouter.post("/:categoryId/delete",deleteCategoryById);

export default categoryRouter;