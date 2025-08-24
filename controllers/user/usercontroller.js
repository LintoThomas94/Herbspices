
const User = require("../../models/userSchema");
const { response } = require("../../app");

const loadSignup= async(req,res)=>{
    try{
        return res.render('signup');
    }catch(error){
        console.log("Home page not loading :",error);
        res.status(500).send('Server Error');
    }
}

const pageNotFound = async(req,res)=>{
    try{
        return res.render("page.404");
    }catch(error){
        res.redirect('/pageNotFound')
    }
}





const loadHomepage=async(req,res)=>{
    try{
        return res.render("home");
    }catch(error){
        console.log("Home page note found");
        res.status(500).send("Server Error");
    }
}

const signup=async(req,res)=>{
    const {firstname,lastname,email,phone,password,confirmpassword}=req.body;
    try{
const newUser= new User({firstname, lastname,email,phone,password,confirmpassword});
console.log(newUser);
await newUser.save();
return res.redirect("/signup")
    }catch (error){
console.error("Error for save user",error);
res.status(500).send('Internal Server Error');
    }
}

module.exports={
    loadHomepage,
    loadSignup,
    pageNotFound,
    signup,
}