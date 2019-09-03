const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token)
    return res.status(401).json({
      error: true,
      message: `No autorizado`
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.total = req.params.total;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: `Token ivalido`
    });
  }
}
module.exports = auth;
