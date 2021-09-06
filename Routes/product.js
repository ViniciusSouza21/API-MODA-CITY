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
      "SELECT * FROM product WHERE supplier = ?;",
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
    console.log(req.file);

    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "INSERT INTO product (supplier, description, value, available, unit, category, name, photo) VALUES (?,?,?,?,?,?,?,?)",
        [
          req.body.supplier,
          req.body.description,
          req.body.value,
          req.body.available,
          req.body.unit,
          req.body.category,
          req.body.name,
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
            image_product: req.file.path,
            message: "Produto inserido com sucesso!",
            id_product: result.insertId,
          });
        }
      );
    });
  }
);

router.patch(
  "/",
  AuthMiddleware.auth,
  (req, res, next) => {
    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "UPDATE product SET description = ?, value = ?, available = ?, unit = ?, category = ?, name = ?, supplier = ? WHERE id = ?",
        [
          req.body.description,
          req.body.value,
          req.body.available,
          req.body.unit,
          req.body.category,
          req.body.name,
          req.body.supplier,
          req.body.id,
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
            message: "Alteração concluída com sucesso!",
          });
        }
      );
    });
  }
);

router.patch(
  "/photo",
  upload.single("photo"),
  AuthMiddleware.auth,
  (req, res, next) => {
    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        "UPDATE product SET photo = ? WHERE id = ?",
        [
          req.file.path,
          req.body.id,
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
            message: "Alteração concluída com sucesso!",
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
          message: "Produto removido com sucesso!",
        });
      }
    );
  });
});

module.exports = router;
