const express = require("express");
const productSchema = require("../models/productSchema");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const checkAuth = require('../middleware/checkAuth');



const storage = multer.diskStorage({
  
  destination: function(req, file, cb ){
    cb(null, './uploads');
  },
  filename: function(req, file, cb){
    
    cb(null, Date.now() + file.originalname)
  }
})

const fileFilter = (req, file, cb)=>{
  //reject a file
  if(file.mimetype === 'image/jpeg'  || file.mimetype === 'image/png'){
    cb(null, true);
  }else
  cb(null, false)
  
};

const upload = multer({storage: storage, 
  limits:{
fileSize: 1024 * 1024 * 5
},
fileFilter: fileFilter })


router.get("/", (req, res, next) => {
  productSchema
    .find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "htpp://localhost:3020/products/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});


router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => {
  const products = new productSchema({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  products.save()
     .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created product succesfully",
        createdProduct:{
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'GET',
            url: "http://localhost:3020/products/" + result._id,
          },
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//for single product
router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  productSchema
    .findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request:{
            type: "GET",
              url: "http://localhost:3020/products"
          }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  productSchema
    .updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Product Updated',
        request:{
          type: "GET",
            url: "http://localhost:3020/products/" + id
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  productSchema
    .deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Product deleted',
        request:{
          type: "POST",
            url: "http://localhost:3020/products" ,
            body: {name: 'String', price: 'Number'}
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
