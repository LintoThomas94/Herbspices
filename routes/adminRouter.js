const express = require("express");
const router = express.Router();

const admincontroller = require("../controllers/admin/admincontroller");
const customercontroller = require("../controllers/admin/customercontroller");
const categorycontroller = require("../controllers/admin/categorycontroller");
const brandcontroller = require("../controllers/admin/brandcontroller");
const productcontroller = require("../controllers/admin/productcontroller");
const { adminAuth } = require("../middlewares/Auth");

const multer = require("multer");
const storage = require("../helpers/multer");
const upload = multer({ storage });

// Error page
router.get("/pageerror", admincontroller.pageerror);

// Login
router.get("/admin-login", admincontroller.loadLogin);
router.post("/admin-login", admincontroller.login);
router.get("/dashboard", adminAuth, admincontroller.loadDashboard);
router.get("/logout", admincontroller.logout);

// Customers Management
router.get("/users", adminAuth, customercontroller.customerInfo);
router.get("/blockcustomer", adminAuth, customercontroller.customerBlocked);
router.get("/unblockcustomer", adminAuth, customercontroller.customerunBlocked);

// Categories Management
router.get("/category", adminAuth, categorycontroller.categoryInfo);
router.post("/addCategory", adminAuth, categorycontroller.addCategory);
router.get("/listCategory", adminAuth, categorycontroller.listCategory);
router.get("/unlistCategory", adminAuth, categorycontroller.unlistCategory);
router.get("/editCategory/:id", adminAuth, categorycontroller.geteditCategory);
router.post("/editCategory/:id", adminAuth, categorycontroller.editCategory);
router.post("/deleteCategory", adminAuth, categorycontroller.deleteCategory);

// Brands Management
router.get("/brands", adminAuth, brandcontroller.getBrandPage);
router.post("/addBrand", adminAuth, upload.single("image"), brandcontroller.addBrand);
router.get("/listBrand", adminAuth, brandcontroller.listBrand);
router.get("/unlistBrand", adminAuth, brandcontroller.unlistBrand);
router.get("/deleteBrand", adminAuth, brandcontroller.deleteBrand);

// Products Management
router.get("/addProducts", productcontroller.getProductAddPage);
router.get("/getProducts", productcontroller.loadProductsPage);
router.post("/addProducts",upload.array("images",3),productcontroller.addProducts);
router.put('/updateProduct', upload.array('newImages', 3), productcontroller.updateProduct);
router.delete('/deleteProduct/:productId',productcontroller.deleteProduct)
router.patch('/updateProductStatus/:productId', productcontroller.statusUpdate)

module.exports = router;
