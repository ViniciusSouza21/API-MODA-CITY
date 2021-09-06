const express = require("express");
const app = require("../app");
const router = express.Router();
const mysql = require("../Config/connection").pool;
const bcrypt = require("bcrypt");
const AuthMiddleware = require("../Middleware/AuthMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter
});

router.get("/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM user WHERE id = ?;",
      id,

      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }

        return res.status(200).send({ response: result });
      }
    );
  });
});

router.get("/", AuthMiddleware.auth, (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM user;",

      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }

        return res.status(200).send({ response: result });
      }
    );
  });
});

router.post("/", upload.single("photo"), (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM user WHERE email = ?",
      [req.body.email],
      (error, results) => {
        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }

        if (results.length > 0) {
          res.status(401).send({
            message: "E-mail address already registered in the system.",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
            if (errBcrypt) {
              return res.status(500).send({ error: errBcrypt });
            }

            conn.query(
              "INSERT INTO user (admin, seller, firstName, lastName, email, password, state, city, photo) VALUES (?,?,?,?,?,?,?,?,?)",
              [
                req.body.admin,
                req.body.seller,
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                hash,
                req.body.state,
                req.body.city,
                req.file.path,
              ],

              (error, result, field) => {
                conn.release();

                if (error) {
                  return res.status(500).send({
                    error: error,
                    response: null,
                  });
                }
                res.status(201).send({
                  message: "Successfully registered user!",
                  id_user: result.insertId,
                });
              }
            );
          });
        }
      }
    );
  });
});

router.put("/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "UPDATE user SET admin = ?, seller = ?, firstName = ?, lastName = ?, email = ?, state = ?, city = ? WHERE id = ?",
      [
        req.body.admin,
        req.body.seller,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.state,
        req.body.city,
        id,
      ],

      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        res.status(202).send({
          message: "Change completed sucessfully!",
        });
      }
    );
  });
});

router.patch("/personal/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "UPDATE user SET seller = ?, firstName = ?, lastName = ?, email = ? WHERE id = ?",
      [
        req.body.seller,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        id,
      ],

      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        res.status(202).send({
          message: "Change completed successfully!",
        });
      }
    );
  });
});

router.patch(
  "/photo/:id",
  upload.single("photo"),
  AuthMiddleware.auth,
  (req, res, next) => {
    const id = req.params.id;

    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "UPDATE user SET photo = ? WHERE id = ?",
        [req.file.path, id],

        (error, result, field) => {
          conn.release();

          if (error) {
            return res.status(500).send({
              error: error,
              response: null,
            });
          }
          res.status(202).send({
            message: "Successfully altered profile picture!",
          });
        }
      );
    });
  }
);

router.patch("/address/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "UPDATE user SET state = ?, city = ? WHERE id = ?",
      [req.body.state, req.body.city, id],

      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        res.status(202).send({
          message: "Change completed sucessfully!",
        });
      }
    );
  });
});

router.patch("/password/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query = "SELECT * FROM user WHERE id = ?";

    conn.query(query, [id], (error, results, fields) => {
      conn.release();

      if (error) {
        return res.status(500).send({ error: error });
      }

      if (results.length < 1) {
        return res.status(401).send({ message: "Enter your old password!" });
      }

      bcrypt.compare(
        req.body.oldPassword,
        results[0].password,
        (err, result) => {
          const pass = bcrypt.compare(
            req.body.oldPassword,
            results[0].password
          );

          if (err) {
            return res.status(401).send({ message: "Authentication failed!" });
          }

          const hash = bcrypt.hashSync(req.body.newPassword, 10);

          if (result) {
            conn.query("UPDATE user SET password = ? WHERE id = ?", [hash, id]);

            return res.status(200).send({
              message: "Password changed successfully!",
            });
          }

          return res.status(401).send({
            valid: false,
            message: "Invalid password!",
          });
        }
      );
    });
  });
});

router.patch("/admin/password/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    conn.query(
      "UPDATE user SET password = ? WHERE id = ?",
      [hash, id],

      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        res.status(202).send({
          message: "Change completed sucessfully!",
        });
      }
    );
  });
});

router.delete("/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "DELETE FROM user WHERE id = ?",
      id,

      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        res.status(202).send({
          message: "User deleted successfully!",
        });
      }
    );
  });
});

module.exports = router;
