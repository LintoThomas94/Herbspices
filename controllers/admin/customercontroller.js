const User = require("../../models/userSchema");

const customerInfo = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 7;

    const userData = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
    .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
      
    }).countDocuments();

    // ✅ pass "data" to EJS
    res.render("customers", {
      data: userData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const customerBlocked = async (req,res)=>{
try {
    let id=req.query.id;
    await User.updateOne({_id:id},{$set:{isBlocked:true}});
    res.redirect("/admin/users")
} catch (error) {
    console.log(1)
    res.redirect("/pageerror");
}    
};
const customerunBlocked = async (req,res)=>{
    try {
        let id = req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        console.log(1)
        res.redirect("/admin/users");
    } catch (error) {
        console.log(2)
        res.redirect("/pageerror");
    }
};


module.exports = { 
    customerInfo,
    customerBlocked,
    customerunBlocked,
 };
