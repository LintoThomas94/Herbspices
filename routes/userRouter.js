const express = require("express");
const router = express.Router();
const passport = require('passport');
const usercontroller = require('../controllers/user/usercontroller');
const profileController =require("../controllers/user/profileController");
require("../config/passport"); 


router.use((req,res,next)=>{
    if(req.session.user){
        res.locals.user = req.session.user
    }else{
        res.locals.user = null;
    }
    next();
})

//error management
router.get('/pageNotFound', usercontroller.pageNotFound);
//signup management
router.get("/signup", usercontroller.loadSignup);
router.post("/signup", usercontroller.signup);
router.post("/verify-otp", usercontroller.verifyOtp);
router.post("/resend-otp", usercontroller.resendOtp);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
 
//     res.redirect('/')
// });

//google signup
router.get("/auth/google/callback",[
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/user/login?error=blocked'
  }),
  (req, res) => {
    req.session.user = req.use
    res.redirect('/');
  }
]);

//Login management
router.get("/login",usercontroller.loadLogin);
 router.post("/login",usercontroller.login);


//Home page and shoping page
router.get('/',usercontroller.loadHomepage);
router.get("/logout",usercontroller.logout);
router.get("/shop",usercontroller.loadShoppingPage);
router.get("/filter",usercontroller.filterProduct);
router.get("/filterPrice",usercontroller.filterByPrice);



//Profile management
router.get("/forgot-password",profileController.getForgotpassPage);
router.post("/forgot-email-valid",profileController.forgotEmailValid);
router.post("/verify-passForgot-otp",profileController.verifyForgotPassOtp);
router.get("/reset-password",profileController.getResetPassPage);
router.post("/resend-forgot-otp",profileController.resendOtp);
router.post("/reset-password",profileController.postNewPassword);

module.exports = router;
