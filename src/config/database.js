const mongoose = require('mongoose')
const connectDB = async()=>{
  await mongoose.connect(
    "mongodb+srv://bikash123:C9kABNULfxQsxfIf@cluster0.liqocuw.mongodb.net/devTinder",
  );
}

module.exports = connectDB;