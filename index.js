require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./route/authRoute");
const cors = require("cors");


const app = express();
app.use(express.json()); // Use o middleware nativo do Express para análise JSON

app.use(
  cors({
    origin: "*",
    methods: "GET, POST",
    allowedHeaders: "Content-Type, Authorization",
  })
);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const port = process.env.PORT || 3001;

app.use(authRoutes); // Configurar middleware de rotas

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@auth.ypun52w.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectou ao banco de dados");
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => console.error("Erro de conexão com o MongoDB", err));