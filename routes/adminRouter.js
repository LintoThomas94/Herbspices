const express = require("express");
const router = express.Router();
const admincontroller = require("../controllers/admin/admincontroller");
const customercontroller = require("../controllers/admin/customercontroller");
const categorycontroller = require("../controllers/admin/categorycontrller");
const {userAuth,adminAuth} =require("../middlewares/Auth");


router.get("/pageerror",admincontroller.pageerror);

//login management

router.get("/admin-login",admincontroller.loadLogin);
router.post("/admin-login",admincontroller.login);
router.get("/dashboard",adminAuth,admincontroller.loadDashboard);
router.get("/logout",admincontroller.logout);

//customer management

router.get("/users",adminAuth,customercontroller.customerInfo);
router.get("/blockcustomer",adminAuth,customercontroller.customerBlocked);
router.get("/unblockcustomer",adminAuth,customercontroller.customerunBlocked);

//catagory management

router.get("/category",adminAuth,categorycontroller.categoryInfo);
router.post("/addCategory",adminAuth,categorycontroller.addCategory);
router.post("/addCategoryOffer",adminAuth,categorycontroller.addCategoryOffer);
router.post("/removeCategoryOffer",adminAuth,categorycontroller.removeCategoryOffer);
router.get("/listCategory",adminAuth,categorycontroller.listCategory);
router.get("/unlistCategory",adminAuth,categorycontroller.unlistCategory);

module.exports = router;