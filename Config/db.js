require('dotenv').config();
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
//  const MONGODB_URI = "mongodb+srv://adigun:hakeem@cluster0.ncmalbd.mongodb.net/AcamindInv?retryWrites=true&w=majority";

const connectionParams={
    useNewUrlParser: true,
//  useCreateIndex: false,
    useUnifiedTopology: true 
}

mongoose.connect(process.env.MONGODB_URI,connectionParams 
    ).then((data)=>{
        console.log('DATABASE CONNECTION SET')
    }).catch((err)=>{
        console.log(err)
    })