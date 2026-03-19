function notFound(req, res, next) {
  res.status(404).json({
    error: { message: "Route bulunamadi." },
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Beklenmeyen bir hata olustu.";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: { message },
  });
}

module.exports = {
  notFound,
  errorHandler,
};
