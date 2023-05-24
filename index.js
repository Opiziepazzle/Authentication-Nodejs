const express = require('express')
const app = express()
const PORT = process.env.PORT || 3020
const fs = require('fs')
const path = require('path')
const morgan  = require('morgan')
const mongoose = require('mongoose')
const bodyParser  = require('body-parser')
const productRoutes = require('./API/Routes/productRoutes')
 const orderRoutes = require('./API/Routes/orderRoutes')
 const userRoutes = require('./API/Routes/userRoutes')

 require('./Config/db')
 require('dotenv').config();

 //To avoid the terminal Warnings
 mongoose.Promise = global.Promise;


 app.use(morgan('dev'));

 //making upload folder publicly available and then passing the middleware
 app.use('/uploads', express.static('uploads') )


 app.use(bodyParser.urlencoded({extended: false}))
 app.use(bodyParser.json());

 

 //Handling CORS Error
app.use((req, res, next) =>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization "
  );
  if ( req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({});
  }
  next();
})


// app.use(express.json())
// app.use(express.urlencoded({extended: false}))



//Routes which should handle request
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)



//Error Handling
app.use((req, res, next)=>{
  const error = new Error('Not found')
  error.status = 404;
  next(error)
})

app.use((error, req, res, next)=>{
  res.status(error.status || 500);
  res.json({
error: {
  message: error.message
}
  })
})









app.listen(PORT, () => {
    console.log(`Server started running on port ${PORT}`);
  });