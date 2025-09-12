const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");
const { default: mongoose } = require("mongoose");

const getProductAddPage = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });

    res.render("product-add", { cat: category, brand });
  } catch (error) {
    console.error("Error loading Add Product page:", error);
    res.redirect("/admin/pageerror");
  }
};


const  deleteProduct =async (req,res) =>{

  try{

    const product = await Product.findById(req.params.productId);

    if(!product){
      return res.statsu(500).json({message: 'product not found'})
    }

    product.isBlocked = product.isBlocked && false;

    await product.save()
    return res.status(200).json({message: 'product ddeleted successfully'})

  }catch(err){

    res.statsu(500).jsno({message: 'erro occured'})
  }

}



const statusUpdate = async (req,res) => {
  try{

    const product = await Product.findById(req.params.productId);

    if(!product){
      return res.status(500).jsno({message: 'product not found'});
    }


    if(product.status == 'Available'){
      product.status = 'Discontinued';
      product.isBlocked = true;
    }else{
            product.status = 'Available';
            product.isBlocked = false;
    }


    await product.save();

    res.status(200).json({message: 'product updated'})

  }catch(err){
    res.status(500).json({messgae: err})
  }


}



const loadProductsPage = async (req,res) =>{

  try{

    const products = await Product.find().populate('category brand');

    res.status(200).json(products)

  }catch(err){
    res.status(500).json({message: 'error', success:false })
  }
}


const addProducts = async (req, res) => {
  try {
    const products = JSON.parse(req.body.productData)
    console.log("PRODUCTS DATA:",products)

    const productExists = await Product.findOne({ productName: products.name });
    if (productExists) {
      return res.status(400).json("Product already exists, please try with another name");
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, "../../public/uploads/product-image");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;
        const resizedImagePath = path.join(uploadDir, req.files[i].filename);

        await sharp(originalImagePath)
          .resize({ width: 440, height: 440 })
          .toFile(resizedImagePath);

        images.push(req.files[i].filename);
      }
    }

    const categoryId = await Category.findOne({ _id: products.category });
    if (!categoryId) {
      console.log("cdcfc",categoryId)
      return res.status(400).send("Invalid category name");
    }

    const newProduct = new Product({
      productName: products.name,
      description: products.description,
      brand: products.brand,
      category: categoryId._id,
      regularPrice: products.regularPrice,
      salePrice: products.salePrice,
      createdOn: new Date(),
      quantity: products.quantity,
      size: products.size,
      weight: products.weight,
      productImage: images,
      status: "Available",
    });

    await newProduct.save();
    return res.status(200).json({message: 'product added successfulyy'})
  } catch (error) {
    console.error("Error saving product", error);
    return res.redirect("/admin/pageerror");
  }
};


const updateProduct = async (req, res) => {
    try {
        const { productData, existingImages } = req.body;
        const parsedProductData = JSON.parse(productData);
        const parsedExistingImages = JSON.parse(existingImages || '[]');


       // Find the product
const product = await Product.findById(parsedProductData._id);
if (!product) {
    return res.status(404).json({ message: 'Product not found' });
}

        // Handle file uploads
        const newImages = [];
    if (req.files && req.files.length > 0) {
      //  upload directory exists
      const uploadDir = path.join(__dirname, "../../public/uploads/product-image");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;
        const resizedImagePath = path.join(uploadDir, req.files[i].filename);

        await sharp(originalImagePath)
          .resize({ width: 440, height: 440 })
          .toFile(resizedImagePath);

        newImages.push(req.files[i].filename);
      }
    }

        // Combine existing and new images
        const allImages = [...parsedExistingImages, ...newImages];

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            parsedProductData._id,
            {
                productName: parsedProductData.name,
                description: parsedProductData.description,
                brand: parsedProductData.brand,
                category: parsedProductData.category,
                regularPrice: parsedProductData.regularPrice,
                salePrice: parsedProductData.salePrice,
                quantity: parsedProductData.quantity,
                weight: parsedProductData.weight,
                productImage: allImages
            },
            { new: true, runValidators: true }
        );

        // Remove images that are no longer used
        const imagesToRemove = product.productImage.filter(
            image => !allImages.includes(image)
        );

        // Delete removed images from filesystem
        imagesToRemove.forEach(image => {
            const imagePath = path.join(__dirname, '../uploads/product-image', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  getProductAddPage,
  addProducts,
  loadProductsPage,
  statusUpdate,
  updateProduct,
  deleteProduct
};
