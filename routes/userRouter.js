const express = require("express");
const router = express.Router();
const usercontroller=require('../controllers/user/usercontroller')

router.get('/"pageNotFound',usercontroller.pageNotFound);
router.get('/',usercontroller.loadHomepage);
router.get("/signup",usercontroller.loadSignup);
router.post("/signup",usercontroller.signup);



module.exports=router;