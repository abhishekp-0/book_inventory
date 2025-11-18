import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import logger from "./config/logger.js";
import bookRouter from "./routes/bookRouter.js";
import categoryRouter from "./routes/categoryRouter.js";

dotenv.config();
const app = express();

const isProduction = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");

const assetsPath=path.join(__dirname,"public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({extended:true}));

// HTTP request logging
const morganFormat = isProduction ? "combined" : "dev";
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

const links=[
  {href:"/",text:"Home"},
  {href:"/category",text:"Genres"},
  {href:"/book",text:"Books"}
];
app.get("/", (req, res) => res.render("index",{links:links}));
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use("/category",categoryRouter);
app.use("/book",bookRouter);

// 404 handler - must be after all other routes
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    statusCode: statusCode
  });

  // In production, don't expose error details to users
  if (isProduction) {
    // Generic error messages for production
    const userMessage = statusCode === 404 
      ? "Page not found" 
      : "Something went wrong. Please try again later.";
    
    res.status(statusCode).render("error", {
      links: links,
      statusCode: statusCode,
      message: userMessage
    });
  } else {
    // Detailed errors for development
    res.status(statusCode).render("error", {
      links: links,
      statusCode: statusCode,
      message: err.message,
      stack: err.stack
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    logger.error("Failed to start server:", error);
    throw error;
  }
  logger.info(`App listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});