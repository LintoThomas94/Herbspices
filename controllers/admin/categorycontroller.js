const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

// Fetch & paginate categories
const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const categoryData = await Category.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        res.render("category", {
            cat: categoryData,
            currentPage: page,
            totalPages,
            totalCategories
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
};

// Add new category
const addCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }
        const newCategory = new Category({ name: name.trim(), description });
        await newCategory.save();
        return res.json({ message: "Category added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Apply category offer
const addCategoryOffer = async (req, res) => {
    try {
        const percentage = parseInt(req.body.offerValue);
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }

        const products = await Product.find({ category: categoryId });
        const hasProductOffer = products.some(
            (product) => product.productOffer > percentage
        );

        if (hasProductOffer) {
            return res.json({
                status: false,
                message:
                    "Some products already have higher product offers. Update those first."
            });
        }

        await Category.updateOne({ _id: categoryId }, { $set: { categoryOffer: percentage } });

        for (const product of products) {
            product.productOffer = 0;
            product.salePrice = product.regularPrice * (1 - percentage / 100);
            await product.save();
        }

        res.json({ status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Remove category offer
const removeCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }

        const products = await Product.find({ category: category._id });

        if (products.length > 0) {
            for (const product of products) {
                product.salePrice = product.regularPrice;
                product.productOffer = 0;
                await product.save();
            }
        }

        category.categoryOffer = 0;
        await category.save();

        res.json({ status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server Error" });
    }
};

// List category
const listCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror");
    }
};

// Unlist category
const unlistCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror");
    }
};

// UPDATED: Permanent delete category and its products
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Permanently delete all products in this category
        await Product.deleteMany({ category: categoryId });

        // Permanently delete the category 
        await Category.findByIdAndDelete(categoryId);

        res.json({ success: true, message: "Category and its products deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// geteditCategory
const geteditCategory = async (req, res) => {
    try {
        const id = req.params.id; 
        const category = await Category.findById(id);
        if (!category) {
            return res.redirect("/pageerror");
        }
        res.render("edit-category", { category });
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
};


// Edit Category
const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { categoryname, description } = req.body;

        const existingCategory = await Category.findOne({
            name: categoryname.trim(),
            _id: { $ne: id }
        });

        if (existingCategory) {
            return res.status(400).json({ error: "Category name already exists" });
        }

        const updateCategory = await Category.findByIdAndUpdate(
            id,
            { name: categoryname.trim(), description },
            { new: true }
        );

        if (updateCategory) {
            res.redirect("/admin/category");
        } else {
            res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    categoryInfo,
    addCategory,
    addCategoryOffer,
    removeCategoryOffer,
    listCategory,
    unlistCategory,
    deleteCategory,
    geteditCategory,
    editCategory,
};