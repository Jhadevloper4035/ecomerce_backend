const express = require("express");
const router = express.Router();
const { isAdmin, isLoggedIn } = require("../middleware/tokenVerification.js");
const Product  = require("../models/product.model.js");
const { createProduct , getAllProducts , getSingleProduct , deletProduct  , addReviewToProduct} = require("../controllers/product.js");


// Admin routes
router.delete("/:id" ,  isLoggedIn , isAdmin, deletProduct)
router.post("/create",  isLoggedIn , isAdmin, createProduct )


//public route without authcheck 
router.post("/all-products",   getAllProducts )
router.post("/:id" , getSingleProduct)

//public route without authcheck 
router.put("/star/:id", isLoggedIn ,  addReviewToProduct )










module.exports = router;