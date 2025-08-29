const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");


const categoryInfo = async(req,res)=>{

    try {
        const page = parseInt(req.query.page) || 1;
        const limit =4;
        const skip =(page-1)*limit;

        const categoryData = await Category.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        const totalcatagories = await Category.countDocuments();
        const totalPage = Math.ceil(totalcatagories/limit);
        res.render("category",{
            cat:categoryData,
            currentPage:page,
            totalPages:totalPage,
            totalcatagories:totalcatagories
        });

    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}
    
const addCategory = async(req,res)=>{
    const {name,description} = req.body;
    
    try {
        const existingCategory = await Category.findOne({name});
        if(existingCategory){
            return res.status(400).json({error:"Category already exist"})
        }
        const newCategory = new Category({
            name,
            description,
        })
        await newCategory.save();
        return res.json({message:"Category added successfully"})
    } catch (error) {
        return res.status(500).json({error:"Internal Server Error"});
    }
};

const addCategoryOffer = async(req,res)=>{
    try {
        const percentage = parseInt(req.body.offerValue); 
        const categoryId =req.body.categoryId;
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).json({status:false , message:"Category not found"});
        }
        
        const products = await Product.find({category:categoryId});
        const hasProductOffer = products.some((product)=>product.productOffer > percentage);
        
        if(hasProductOffer){
            return res.json({status:false , message: "Products within this category already have product offers greater than the new category offer. Please update those first."})
        }
        
        await Category.updateOne({_id:categoryId},{$set: {categoryOffer:percentage}});
        
        for(const product of products){
            product.productOffer = 0;
            product.salePrice = product.regularPrice * (1 - percentage / 100);
            await product.save();
        }
        
        res.json({status:true});
    } catch (error) {
        console.error(error);
        res.status(500).json({status:false,message:"Internal Server Error"})
    }
};



const removeCategoryOffer = async (req,res)=>{
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(404).json({status:false ,message:"Category not found"})
        }
    
        const products = await Product.find({category:category._id});

        if(products.length>0){
            for(const product of products){
                product.salePrice = product.regularPrice;
                product.productOffer = 0; 
                await product.save();
            }
        }
    
        category.categoryOffer = 0;
        await category.save();
    
        res.json({status:true});   
    
    } catch (error) {
        console.error(error);
        res.status(500).json({status:false , message:"Internal server Error"})
    }
};

// Renamed from getUnlistCategory
const listCategory = async (req,res)=>{
    try {
        let id = req.query.id;
        // Correctly sets the category to listed
        await Category.updateOne({_id:id},{$set:{isListed:true}});
        res.redirect("/admin/category"); // Redirect back to the category page
    } catch (error) {
        res.redirect("/pageerror");
    }
}

// Renamed from getListCategory
const unlistCategory = async (req,res)=>{
    try {
        let id = req.query.id;
        // Correctly sets the category to unlisted
        await Category.updateOne({_id:id},{$set:{isListed:false}});
        res.redirect("/admin/category"); // Redirect back to the category page
    } catch (error) {
        res.redirect("/pageerror");
    }
}


module.exports ={
    categoryInfo,
    addCategory,
    addCategoryOffer,
    removeCategoryOffer,
    listCategory,
    unlistCategory,
};