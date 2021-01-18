var express = require("express");
var router = express.Router();

var ctrlDigerleri = require("../controllers/digerleri");
var ctrlmekanlar = require("../controllers/mekanlar");

router.get("/", ctrlmekanlar.anaSayfa);
router.get("/mekan/:mekanid", ctrlmekanlar.mekanBilgisi);
router.get("/mekan/:mekanid/yorum/yeni", ctrlmekanlar.yorumEkle);
router.post("/mekan/:mekanid/yorum/yeni", ctrlmekanlar.yorumumuEkle);

module.exports = router;
