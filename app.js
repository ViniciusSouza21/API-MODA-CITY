const express = require("express");
const app = express();
const morgan = require("morgan");

app.use('/uploads', express.static('uploads'));

// const cors = require("cors");

const routeUsers = require("./Routes/user");
const routeProducts = require("./Routes/product");

const rotaLogin = require("./Routes/login");

// const corsOptions = {
//   origin: "https://localhost:19000",
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-Widh, Accept, Authorization, Content-Type"
  );

  if (res.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, DELETE, GET, PATCH, HEAD"
    );
    return res.status(200).send({});
  }

  next();
});

app.use("/users", routeUsers);
app.use("/products", routeProducts);

app.use("/login", rotaLogin);

app.use((req, res, next) => {
  const erro = new Error("Not found!");
  erro.status(404);
  next(erro);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro: {
      message: error.message,
    },
  });
});

app.use('/uploads', express.static('./uploads'));

module.exports = app;
