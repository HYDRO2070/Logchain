const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDb connected .....");
    })
    .catch((err) => {
        console.error("mongoDB connection error : ", err);
    })
};

module.exports = connectDB;
