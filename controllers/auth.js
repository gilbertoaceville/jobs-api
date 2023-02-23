const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });

  // token is gotten from an instance method attached to the schema //check UserSchema
  const token = user.createJWT(); // UserSchema instance method (createJWT)

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError("Please provide email and password");

  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError("Invalid Credentials");

  const isSamePassword = await user.comparePassword(password)
  if(!isSamePassword) throw new UnauthenticatedError("Invalid Credentials")
  
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = { register, login };
