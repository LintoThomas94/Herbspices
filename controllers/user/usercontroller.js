

const User = require("../../models/userSchema");
const Category= require("../../models/categorySchema");
const Product = require("../../models/productSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Brand = require("../../models/brandSchema");



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
//     try {
//         if(req.session.user){

// console.log("The load home pateess",req.session.user)
//         return res.render("home",{user:req.session.user});
//         }else{
//             delete req.session.user;
//             return res.render("home")
//         }

            try{
                const user = req.session.user;
                
                const Categories = await Category.find({isListed:true});
               
                let productData = await Product.find(
                    {isBlocked:false,
                        category:{$in:Categories.map(category=>category._id)},quantity:{$gt:0}
                    }
                )

                console.log(productData)

                //productData.sort((a,b)=>new Data(b.createdAt)-new Data(a.createdAt));
              //  productData = productData.slice(0,4);
                console.log(productData);

                if(user){
                    const userData = await User.findOne({_id: user._id});
                    return res.render("home",{userData,product:productData});
                }else{
                    return res.render("home",{product:productData});
                }
    } catch (error) {
        console.log("Home page not found:", error);
        res.status(500).send("Server Error");
    }
};



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

        // Render the OTP verification page 
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
            delete req.session.userData; //

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

        delete req.session.user;
      // req.session.destroy((err)=>{
        //if(err){
          //  console.log("Session destruction error",err.message);
            //return res.redirect("/pageNotFound");
        //}
        return res.redirect("/")
    } catch (error) {
        console.log("Logout error",error);
        res.redirect("/pageNotFound")
        
    }
};

const loadShoppingPage = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = user ? await User.findById(user._id) : null;

    const Categories = await Category.find({ isListed: true });
    const categoryIds = Categories.map(category => category._id.toString());

    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const product = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 }
    }).populate("brand")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 }
    });

    const totalPages = Math.ceil(totalProducts / limit);

    const brands = await Brand.find({ isBlocked: false });
    const CategoriesWithIds = Categories.map(category => ({
      _id: category._id,
      name: category.name
    }));
console.log(product)

console.log(brands)

    res.render("shop", {
      user: userData,
      products: product,
      category: CategoriesWithIds,
      brand: brands,
      totalProducts,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error("Shopping page error:", error);
    res.redirect("/page-not-found");
  }
};

const filterProduct = async (req, res) => {
    try {
        const { category, brand, page = 1 } = req.query;
        const user = req.user; 
        const itemsPerPage = 6;

        // Build query for products
        const query = {
            isBlocked: false,
            quantity: { $gt: 0 }
        };

        // Fetch category if provided
        const findCategory = category ? await Category.findOne({ _id: category }) : null;
        if (findCategory) {
            query.category = findCategory._id;
        }

        // Fetch brand if provided
        const findBrand = brand ? await Brand.findOne({ brandName: brand }) : null;
        if (findBrand) {
            query.brand = findBrand.brandName;
        }

        // Fetch products with sorting
        let findProducts = await Product.find(query)
            .sort({ createdAt: -1 }) // Sort by createdAt descending in MongoDB
            .lean();

        // Fetch categories and brands
        const categories = await Category.find({ isListed: true }).lean();
        const brands = await Brand.find({}).lean();

        // Pagination logic
        const currentPage = parseInt(page) || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const totalPages = Math.ceil(findProducts.length / itemsPerPage);
        const currentProduct = findProducts.slice(startIndex, startIndex + itemsPerPage);

        // Update user search history if user exists
        let userData = null;
        if (user) {
            userData = await User.findOne({ _id: user._id });
            if (userData) {
                const searchEntry = {
                    category: findCategory ? findCategory._id : null,
                    brand: findBrand ? findBrand.brandName : null,
                    searchedOn: new Date(),
                };
                userData.searchHistory.push(searchEntry);
                await userData.save();
            }
        }

        // Store filtered products in session
        req.session.filteredProducts = currentProduct;

        // Render shop page
        res.render("shop", {
            user: userData,
            products: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
            selectedCategory: category || null,
            selectedBrand: brand || null,
        });
    } catch (error) {
        console.error("Error in filterProduct:", error);
        res.status(500).render("error", { message: "Something went wrong" });
    }
};

const filterByPrice = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user }).lean();
        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true }).lean();

        // Validate query parameters
        const gt = parseFloat(req.query.gt) || 0; // Default to 0 if not provided
        const lt = parseFloat(req.query.lt) || Number.MAX_SAFE_INTEGER; // Default to max if not provided

        // Fetch products within price range, not blocked, and with quantity > 0
        let findProduct = await Product.find({
            salePrice: { $gt: gt, $lt: lt },
            isBlocked: false,
            quantity: { $gt: 0 }
        }).lean();

        // Sort products by createdAt in descending order
        findProduct = findProduct.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination logic
        const itemsPerPage = 6;
        const currentPage = parseInt(req.query.page) || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const totalPages = Math.ceil(findProduct.length / itemsPerPage);
        const currentProduct = findProduct.slice(startIndex, endIndex);

        // Store filtered products in session (consider storing only IDs or minimal data)
        req.session.filteredProducts = findProduct.map(product => product._id); // Store only IDs to optimize

        // Render the shop page
        res.render("shop", {
            user: userData,
            products: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
        });
    } catch (error) {
        console.error("Error in filterByPrice:", error);
        res.redirect("/error?message=Failed to filter products");
    }
};




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
    logout,
    loadShoppingPage,
    filterProduct,
    filterByPrice,
}
 
