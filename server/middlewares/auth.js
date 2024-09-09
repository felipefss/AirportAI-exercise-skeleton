function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (token === 'some-hash') {
    return next();
  }
  return res.sendStatus(401);
}

module.exports = { verifyToken };
