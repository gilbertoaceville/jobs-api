// const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };
  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message });
  // }

  // Validation Errors (for fields not provided or missing)
  if (err.name === "ValidationError") {
    // console.log(err) // see register controller as example
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }

  // Duplication Error:  Error for using `unique` values(set in the schema) more than once
  if (err.code && err.code === 11000) {
    // console.log(err) // see register controller as example
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please use another value`;
    customError.statusCode = 400;
  }

  // Cast Error: Possible error may come from adding more values to the id params(req.params.id)
  //i.e id (63f681514ecf2d594605e6d4) then e.g 2 or 349 is added to the end
  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
