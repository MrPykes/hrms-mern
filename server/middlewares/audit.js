const AuditLog = require("../models/AuditLog");

module.exports = async function (req, res, next) {
  res.onFinish = async () => {
    try {
      await AuditLog.create({
        user: req.user?.id,
        action: req.method + " " + req.originalUrl,
        meta: { status: res.statusCode },
      });
    } catch (e) {}
  };
  // attach finish listener
  res.on("finish", res.onFinish);
  next();
};
