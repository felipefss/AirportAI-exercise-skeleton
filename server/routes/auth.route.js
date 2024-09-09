let express = require('express');
let router = express.Router();

router.post('/login', (req, res) => {
  // Here we should validate the user credentials and return a token if they are correct
  // For now, we are just returning a dummy token
  const { email, password } = req.body;

  if (!email || !password) {
    return res.sendStatus(400);
  }

  if (email === 'agent' && password === 'admin') {
    return res.header('Authorization', 'some-hash').sendStatus(200);
  }

  return res.sendStatus(401);
});

module.exports = router;
