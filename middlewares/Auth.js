const User = require("../models/userSchema");

const userAuth =(req,res,next)=>{
    if(req.session.user && req.session.admin===false){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next();
            }else{
                res.redirect("/login")
            }
        })
        .catch(error=>{
            console.log("Error in user auth middleware");
            res.status(500).send("Internal Server error")
        })
    }else{
        res.redirect("/login")
    }
}

// const adminAuth = (req, res, next) => {
//     let userId = req.session.user;
//     if(!userId) res.redirect("/admin/admin-login");
//     console.log(user)
//     User.findOne({ isAdmin: true })
//         .then(data => {
//             if (data) {
//                 next(); 
//             } else {
//                 res.redirect("/admin/admin-login"); 
//             }
//         })
//         .catch(error => {
//             console.log("Error in adminAuth middleware:", error);
//             res.status(500).send("Internal Server Error");
//         });
// };


const adminAuth = (req,res,next)=>{
    try{

        let admin = req.session.admin;
        console.log(req.session.admin)
        //console.log(user);
        if(!admin)
        {
            res.redirect("/admin/admin-login");
            
        }else{
            next();
        }

    }catch(error){

    }
}


module.exports ={
    userAuth,
    adminAuth
}
