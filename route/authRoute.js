const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Rota para o cadastro de usuários (Sign Up)
router.post('/signup', async (req, res) => {
  try {
    const { nome, email, senha, telefones } = req.body;

    // Verifica se o e-mail já está cadastrado
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Cria um novo usuário
    const newUser = new User({
      nome,
      email,
      senha: hashedPassword,
      telefones,
    });

    // Salva o novo usuário no banco de dados
    const savedUser = await newUser.save();

    // Gera um token JWT
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30m', // Tempo de expiração do token
    });

    res.status(201).json({
      id: savedUser._id,
      data_criacao: savedUser.data_criacao,
      data_atualizacao: savedUser.data_atualizacao,
      ultimo_login: savedUser.ultimo_login,
      token,
      mensagem: 'Usuário cadastrado com sucesso',
    });
  } catch (error) {
    console.error('Erro no cadastro de usuário:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
});


// Rota de login
router.post('/signin', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifica se o usuário está cadastrado
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ mensagem: 'Usuário não cadastrado' });
    }

    // Verifica a senha
    const isPasswordValid = await user.comparePassword(senha);
    if (!isPasswordValid) {
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    // Atualiza o último login
    user.ultimo_login = new Date();
    await user.save();

    // Gera um novo token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    res.json({
      id: user._id,
      data_criacao: user.data_criacao,
      data_atualizacao: user.data_atualizacao,
      ultimo_login: user.ultimo_login,
      token,
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor', error: error.message });
  }
});


// Middleware para verificar o token de autenticação
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ mensagem: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: 'Não autorizado' });
  }
};

// Rota para buscar informações do usuário
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json({
      id: user._id,
      data_criacao: user.data_criacao,
      data_atualizacao: user.data_atualizacao,
      ultimo_login: user.ultimo_login,
      token: req.header('Authorization'),
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
});

// Private-Route
router.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    res.status(200).json({ user: user})
    res.json({
      id: user._id,
      data_criacao: user.data_criacao,
      data_atualizacao: user.data_atualizacao,
      ultimo_login: user.ultimo_login,
      token: req.header('Authorization'),
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
});


module.exports = router;