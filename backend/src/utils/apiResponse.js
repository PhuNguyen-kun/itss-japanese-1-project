const responseOk = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const responseError = (
  res,
  message = "Error occurred",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = { responseOk, responseError };
