const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    trime:true
  },

  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  age:{
    type:Number,
    min :18
  },
  gender:{
    type:String,
    validate(value){
      if(!["male","female","others"].includes(value)){
        throw new Error("provided data is not valid")
      }
    }
  },
  photoUrl: {
    type: String,
    default: "https://share.google/Mmw0FGKRswxbbPxxB"
  },
  about: {
    type: String,
    default: "This is a default about of the user",
  },
  skills: {
    type: [String],
  },
},{
  timestamps:true
}

);

module.exports = mongoose.model("User", userSchema);
