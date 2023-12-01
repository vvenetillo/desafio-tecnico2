const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

module.exports = function authMiddleware(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ mensagem: 'Não autorizado' });
  }

  jwt.verify(token.replace('Bearer ', ''), keys.secretOrKey, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ mensagem: 'Sessão inválida' });
      }
      return res.status(401).json({ mensagem: 'Não autorizado' });
    }

    req.user = decoded;
    next();
  });
};
