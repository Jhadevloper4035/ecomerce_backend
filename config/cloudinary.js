const cloudinary = require("cloudinary").v2
require("dotenv").config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


exports.upload = async(req,res) => {
    
  const result = await cloudinary.uploader.upload(req.body.image, {
  public_id : `${Date.now()}`,
  resource_type : "auto",
  })

  res.json({ public_id : public_id , url : result.secure_url})
}

exports.remove = (req,res) => {
    const image_id = req.body.public_id 

    cloudinary.uploader.destroy(image_id , (err , result) => {
        if (err)  return res.json({success : false , err} )
        res.send("ok")
    })
}