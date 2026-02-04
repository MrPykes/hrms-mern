module.exports = function (allowed = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ message: "Access denied" });
    if (typeof allowed === "string") allowed = [allowed];
    if (allowed.length === 0 || allowed.includes(role) || role === "Admin")
      return next();
    return res.status(403).json({ message: "Insufficient permissions" });
  };
};
