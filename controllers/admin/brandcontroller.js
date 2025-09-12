const Brand = require("../../models/brandSchema");

// Get Brands Page
const getBrandPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const totalBrands = await Brand.countDocuments();
    const brands = await Brand.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalBrands / limit);

   res.render("brands", {
  data: brands,
  currentPage: page,
  totalPage: totalPages,
  totalBrands,
  error: null,
});


  } catch (error) {
    console.error("Error loading brands:", error.message);
    res.redirect("/admin/pageerror");
  }
};

// Add Brand
const addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const totalBrands = await Brand.countDocuments();
    const brands = await Brand.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalPages = Math.ceil(totalBrands / limit);

    if (await Brand.findOne({ name: name.trim() })) {
      return res.render("admin/brands", {
        data: brands,
        currentPage: page,
        totalPage: totalPages,
        totalBrands,
        error: "Brand name already exists",
      });
    }

    if (!req.file) {
      return res.render("admin/brands", {
        data: brands,
        currentPage: page,
        totalPage: totalPages,
        totalBrands,
        error: "Image is required",
      });
    }

    const newBrand = new Brand({
      name: name.trim(),
      image: "/project/upload/re-image/" + req.file.filename,
    });

    await newBrand.save();
    res.redirect("/admin/brands");
  } catch (error) {
    console.error("Error adding brand:", error.message);
    res.redirect("/admin/pageerror");
  }
};

// Unblock Brand
const listBrand = async (req, res) => {
  try {
    await Brand.updateOne({ _id: req.query.id }, { $set: { isBlocked: false } });
    res.redirect("/admin/brands");
  } catch (error) {
    console.error("Error unblocking brand:", error.message);
    res.redirect("/admin/pageerror");
  }
};

// Block Brand
const unlistBrand = async (req, res) => {
  try {
    await Brand.updateOne({ _id: req.query.id },{ $set: { isBlocked: true } });
    res.redirect("/admin/brands");
  }catch (error) {
    console.error("Error blocking brand:", error.message);
    res.redirect("/admin/pageerror");
  }
};

// Delete Brand
const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.query.id);
    res.redirect("/admin/brands");
  } catch (error) {
    console.error("Error deleting brand:", error.message);
    res.redirect("/admin/pageerror");
  }
};

module.exports = { getBrandPage, addBrand, listBrand, unlistBrand, deleteBrand };
