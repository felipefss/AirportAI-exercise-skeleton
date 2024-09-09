function getUserRole(req, res, next) {
  const token = req.header('Authorization');
  if (token === 'some-hash') {
    req.userRole = 'admin';
  }

  return next();
}

function denyUnauthorized(req, res, next) {
  if (req.userRole && req.userRole === 'admin') {
    return next();
  }

  return res.sendStatus(401);
}

module.exports = { getUserRole, denyUnauthorized };
