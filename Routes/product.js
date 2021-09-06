const express = require("express");
const app = require("../app");
const router = express.Router();
const mysql = require("../Config/connection").pool;
const AuthMiddleware = require("../Middleware/AuthMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, calback) {
    calback(null, "./Uploads/");
  },
  filename: function (req, file, calback) {
    calback(null, file.originalname);
  },
});

const fileFilter = (req, file, calback) => {
  if (file.mimeType === "image/jpeg" || file.mimeType === "image/png") {
    calback(null, true);
  } else {
    calback(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  // fileFilter: fileFilter
});

router.get("/", AuthMiddleware.auth, (req, res, next) => {

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM product;",

      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }

        return res.status(200).send({ response: result });
      }
    );
  });
});

router.get("/:id", AuthMiddleware.auth, (req, res, next) => {

  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM product WHERE id = ?;",
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

router.get("/user/:id", AuthMiddleware.auth, (req, res, next) => {

  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM product WHERE user = ?;",
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

router.post(
  "/",
  upload.single("photo"),
  AuthMiddleware.auth,
  (req, res, next) => {

    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "INSERT INTO product (name, description, price, color, size, photo, user) VALUES (?,?,?,?,?,?,?)",
        [
          req.body.name,
          req.body.description,
          req.body.price,
          req.body.color,
          req.body.size,
          req.file.path,
          req.body.user,   
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
            message: "Product successfully inserted!",
            id_product: result.insertId,
          });
        }
      );
    });
  }
);

router.patch(
  "/:id",
  AuthMiddleware.auth,
  (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "UPDATE product SET name = ?, description = ?, price = ?, color = ?, size = ? WHERE id = ?",
        [
          req.body.name,
          req.body.description,
          req.body.price,
          req.body.color,
          req.body.size,
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
  }
);

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
        "UPDATE product SET photo = ? WHERE id = ?",
        [
          req.file.path,
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
  }
);

router.delete("/:id", AuthMiddleware.auth, (req, res, next) => {
  const id = req.params.id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "DELETE FROM product WHERE id = ?",
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
          message: "Product deleted successfully!",
        });
      }
    );
  });
});

module.exports = router;
