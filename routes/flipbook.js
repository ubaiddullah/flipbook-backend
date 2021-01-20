const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const multer = require("multer");
var fs = require("fs");
const { Flipbook, validate } = require("../models/flipbook");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.get("/", async (req, res) => {
  const flipbook = await Flipbook.find().select("-__v").sort("name");
  res.send(flipbook);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const flipbook = await Flipbook.findById(req.params.id);

  if (!flipbook) return res.status(404).send("Flipbook does not exist");
  res.send(flipbook);
});

router.post(
  "/",
  [auth, admin, upload.array("flipbookImgs", 10)],
  async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
      if (req.files) {
        req.files.map((image) => {
          fs.unlink(image.path, function (err) {
            if (err) console.log(err);
          });
        });
      }
      return res.status(400).send(error.details[0].message);
    }

    let images = [];
    if (req.files.length > 0) {
      req.files.map((image) => {
        images.push(image.path);
      });
    } else {
      return res.status(400).send("Flipbook images are required");
    }

    const flipbook = new Flipbook({
      title: req.body.title,
      description: req.body.description,
      flipbookImgs: images,
    });
    await flipbook.save();

    res.send(flipbook);
  }
);

router.put(
  "/:id",
  [auth, admin, validateObjectId, upload.array("flipbookImgs", 10)],
  async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
      if (req.files) {
        req.files.map((image) => {
          fs.unlink(image.path, function (err) {
            if (err) console.log(err);
          });
        });
      }
      return res.status(400).send(error.details[0].message);
    }

    const flipbook = await Flipbook.findById(req.params.id);

    let images = [];
    if (req.files.length > 0) {
      req.files.map((image) => {
        images.push(image.path);
      });
      flipbook.flipbookImgs.map((img) => {
        fs.unlink(img, function (err) {
          if (err) console.log(err);
        });
      });
    } else {
      images = flipbook.flipbookImgs;
    }

    flipbook.set({
      title: req.body.title,
      description: req.body.description,
      flipbookImgs: images,
    });

    await flipbook.save();

    res.send(flipbook);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const flipbook = await Flipbook.findByIdAndRemove(req.params.id);
  if (!flipbook) return res.status(404).send("The flipbook was not found");

  flipbook.flipbookImgs.map((img) => {
    fs.unlink(img, function (err) {
      if (err) console.log(err);
    });
  });

  res.send(flipbook);
});

module.exports = router;
