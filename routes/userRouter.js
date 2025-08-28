const express = require("express");
const router = express.Router();
const passport = require("passport"); 
const usercontroller = require('../controllers/user/usercontroller');

router.get('/pageNotFound', usercontroller.pageNotFound);

router.get("/signup", usercontroller.loadSignup);
router.post("/signup", usercontroller.signup);
router.post("/verify-otp", usercontroller.verifyOtp);
router.post("/resend-otp", usercontroller.resendOtp);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
 
//     res.redirect('/')
// });
router.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/signup" }),
    async (req, res) => {
        // storing session manimually
        console.log(req.user)
        req.session.user = req.user;
        
         res.render("home",{user:req.user});
       // res.send("Your are sign with google")
    }
);

router.get("/login",usercontroller.loadLogin);
 router.post("/login",usercontroller.login);



router.get('/',usercontroller.loadHomepage);
router.get("/logout",usercontroller.logout);

module.exports = router;
