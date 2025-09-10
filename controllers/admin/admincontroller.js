const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const pageerror = async (req,res)=>{
    res.render("admin-error")
}

const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect("/admin/dashboard");
    }
    res.render("admin-login", { message: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });
       
        if (!admin) {
            return res.redirect("/admin/admin-login");
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        console.log(passwordMatch);

        if (passwordMatch) {
            req.session.admin = admin;
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/admin/admin-login");
        }

    } catch (error) {
        console.log("login error", error);
        return res.redirect("/pageerror");
    }
};

const loadDashboard = async (req, res) => {
    if (req.session.admin) {
        try {
            return res.render("dashboard");
        } catch (error) {
            return res.redirect("/pageerror");
        }
    } else {
        return res.redirect("/admin/admin-login");
    }
}


    const logout = async(req,res)=>{
        try {
           delete req.session.admin
           res.redirect("/admin/admin-login");
        } catch (error) {

            console.error(error);
        }
    }
    

// const logout = async (req,res)=>{
//     try {
//     //   req.session.destroy(err=>{
//     //     if(err){
//     //         console.log("Error destroying session",err);
//     //         return res.redirect("/pageerror")
//     //     }
//         res.redirect("/admin/admin-login")
//      // })  
//     } catch (error) {
//         console.log(("unexpected error during logout",error));
//         res.redirect("/pageerror")
//     }
// };



module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout,
};
