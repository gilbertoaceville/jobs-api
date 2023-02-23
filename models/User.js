const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

// Mongoose middleware => check mongoose docs
// before saving the document ( hash password here)
UserSchema.pre("save", async function () {
  const salt = await bcryptjs.genSalt(10);
  // this points to this document //schema
  this.password = await bcryptjs.hash(this.password, salt);
});

// used in auth controllers

// UserSchema.methods.getName = function () {
//   return this.name;
// };

// Note: `this` keyword points to this document
UserSchema.methods.createJWT = function () {
  const token = jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  return token;
};

// compare passwords for correct login details (i.e when a user wants to login)
UserSchema.methods.comparePassword = async function (loginPassword) {
  const isMatch = await bcryptjs.compare(loginPassword, this.password);
  return isMatch;
};
module.exports = mongoose.model("User", UserSchema);
