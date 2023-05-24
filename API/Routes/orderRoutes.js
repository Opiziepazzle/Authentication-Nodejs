const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const orderSchema = require("../models/orderSchema");
const productSchema = require("../models/productSchema");

router.get("/", (req, res, next) => {
  orderSchema
    .find()
    
    .populate('product' )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            quantity: doc.quantity,
            product: doc.product,
            _id: doc._id,
            request: {
              type: "GET",
              url: "htpp://localhost:3020/orders/" + doc._id,
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

router.post("/", (req, res, next) => {
  //not to accept Product1d which is not in the order database
  productSchema.findById(req.body.productId).then((product) => {
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const orders = new orderSchema({
      _id: new mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId,
    });
    return orders.save().then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order stored succesfully",
        createdOrder: {
          product: result.product,
          quantity: result.quantity,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3020/orders/" + result._id,
          },
        },
      });
    });
  });
});

//for single product
router.get("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  orderSchema
    .findById(id)
    .populate('product', 'name')
    .exec()
    .then((order) => {
      console.log("From database", order);
      if (order) {
        res.status(200).json({
          order: order,
          request: {
            type: "GET",
            url: "http://localhost:3020/orders",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "Order not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  orderSchema
    .deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Order deleted',
        request:{
          type: "POST",
            url: "http://localhost:3020/orders" ,
            body: {productId: 'ID', quantity: 'Number'}
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
