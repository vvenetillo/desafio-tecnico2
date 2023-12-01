// models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  telefones: [
    {
      numero: String,
      ddd: String,
    },
  ],
  data_criacao: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Adiciona o método comparePassword ao schema
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.senha);
};

// Cria o modelo User com o schema
const User = mongoose.model("User", userSchema);

// Exporta o modelo
module.exports = User;
mongoose.model("User");
