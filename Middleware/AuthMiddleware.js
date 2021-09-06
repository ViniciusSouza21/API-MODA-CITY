const jwt = require("jsonwebtoken");
const config = require("../Config/auth")

exports.auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decode = jwt.verify(token, config.secret);
    
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Authentication failed!",
    });
  }
};
