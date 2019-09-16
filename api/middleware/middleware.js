const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');

  if (!token)
    return res.status(401).json({
      error: true,
      message: `No autorizado`
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: `Token invalido`
    });
  }
}
module.exports = auth;
