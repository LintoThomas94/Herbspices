const User = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");



const loadSignup = async (req, res) => {
    try {
        return res.render('signup');
    } catch (error) {
        console.log("Signup page not loading:", error);
        res.status(500).send('Server Error');
    }
}

const pageNotFound = async (req,res) => {
    try {
        return res.render("page-404");
    } catch (error) {
        res.status(500).send('Page Not Found');
    }
}

const loadHomepage = async (req, res) => {
    try {
        if(req.session.user){
console.log("The load home pateess",req.session.user)
        return res.render("home",{user:req.session.user});
        }else{
            return res.render("home")
        }

            
    } catch (error) {
        console.log("Home page not found:", error);
        res.status(500).send("Server Error");
    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            }
        })

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        })

        return info.accepted.length > 0;
    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}

const signup = async (req, res) => {
    try {
        const { firstname,lastname, phone, email, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.render("signup", { message: "Passwords do not match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("signup", { message: "User with this email already exists" });
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.json({ error: "email-error" });
        }

        req.session.userOtp = otp;
        req.session.userData = { firstname,lastname, phone, email, password };

        // Render the OTP verification page here
        res.render("verify-otp", { message: "" }); 
        console.log("OTP sent:", otp);

    } catch (error) {
        console.error("signup-error", error);
        res.redirect("/page-not-found");
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("Received OTP:", otp);

       if (otp.toString() === req.session.userOtp.toString()) {
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                firstname: user.firstname,
                secondname:user.secondname,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            });

            console.log(saveUserData)

            await saveUserData.save();

            req.session.user = saveUserData;

            // Clear the OTP and userData from session after successful verification
            delete req.session.userOtp;
            delete req.session.userData;

            res.json({ success: true, redirectUrl:"/" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
        }
    } catch (error) {
        console.error("Error verifying OTP", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
}

const resendOtp = async (req,res)=>{
    try {
        const {email} = req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }
        const  otp = generateOtp();
        req.session.userOtp=otp;
        const emailSent = await sendVerificationEmail(email,otp);
        if(emailSent){
            console.log("Resend OTP:",otp);
            res.status(200).json({success:true,message:"OTP Resend successfully"})
        }else{
          res.status(500).json({success:false,message:"Failed to resend OTP. Please try again"});  
        }
    } catch (error) {
        console.error("Error resending OTP",error);
        res.status(500).json({success:false,message:"Internal Server Error. please try again"});
    }
};
 const loadLogin = async (req,res)=>{
    try {
      if(!req.session.user){
        return res.render("login")
      }else{
        res.redirect("/")
      }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
 }

const login = async (req,res)=>{
    try {
        console.log(req.body);
        const {email,password} = req.body;
        const findUser = await User.findOne({isAdmin:0,email:email});
        if(!findUser){
            return res.render("login",{message:"User not found"})
        }
        if(findUser.isBlocked){
            return res.render("login",{message:"User is blocked by admin"})
        }
        const passwordMatch = await bcrypt.compare(password,findUser.password);
        if(!passwordMatch){
            return res.render("login",{message:"Incorrect Password"})
        }
        req.session.user = findUser;
        res.redirect("/")
    } catch (error) {
        console.log(error);
    res.json({error});
        
    }
}

const logout = async (req,res)=>{
    try {
       req.session.destroy((err)=>{
        if(err){
            console.log("Session destruction error",err.message);
            return res.redirect("/pageNotFound");
        }
        return res.redirect("/login")
       }) 
    } catch (error) {
        console.log("Logout error",error);
        res.redirect("/pageNotFound")
        
    }
}
        
    




module.exports = {
    loadHomepage,
    loadSignup,
    pageNotFound,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    pageNotFound,
    login,
    logout
}
