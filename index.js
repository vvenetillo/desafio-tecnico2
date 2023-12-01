require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const authRoutes = require("./route/authRoute");

const app = express();
app.use(bodyparser.json());
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const port = process.env.PORT || 3001;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@auth.ypun52w.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na port ${port}`);
      app.use( authRoutes); 
      app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
          return res.status(400).json({ mensagem: "Erro de análise JSON" });
        }
        next();
      });
    });
    console.log("Conectou ao banco de dados");
  })
  .catch((err) => console.log(err));
