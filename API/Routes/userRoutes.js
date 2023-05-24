const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = require("../models/userSchema");
const jwt = require('jsonwebtoken')



router.post("/signup", (req, res, next) => {
  //to avoid users registering with the same mail
  userSchema
    .find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail Already exist",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new userSchema({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });

            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

//login user
router.post('/login', (req, res) => {
  

  userSchema
    .findOne({ email: req.body.email })
    .exec()
    .then(user => {
      if ( !user || user < 1) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth Failed",
          });
        }

        if (result) {
         const token = jwt.sign({
            email: user.email,
            userId: user._id
          }, process.env.JWT_KEY,{
            expiresIn: "1hr"
          }
           );
          return res.status(200).json({
            message: "Auth Sucessful",
            token: token
          });
        }

        res.status(401).json({
          message: "Auth Failed",
        });

      });
    })
    .catch(err => {
     
      console.log(err);
      res.status(500).json({
        error: err,
      });
      
    });
});





//delete User
router.delete("/:userId", (req, res, next) => {
  userSchema
    .deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
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
