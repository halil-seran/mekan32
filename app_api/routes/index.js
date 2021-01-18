var express = require("express");
var router = express.Router();

var ctrlmekanlar = require("../controllers/mekanlar");
var ctrlYorumlar = require("../controllers/yorumlar");

router
  .route("/mekanlar")
  .get(ctrlmekanlar.mekanlariListele)
  .post(ctrlmekanlar.mekanEkle);

router
  .route("/mekanlar/:mekanid")
  .get(ctrlmekanlar.mekanGetir)
  .put(ctrlmekanlar.mekanGuncelle)
  .delete(ctrlmekanlar.mekanSil);

router.route("/mekanlar/:mekanid/yorumlar").post(ctrlYorumlar.yorumEkle);

router
  .route("/mekanlar/:mekanid/yorumlar/:yorumid")
  .get(ctrlYorumlar.yorumGetir)
  .put(ctrlYorumlar.yorumGuncelle)
  .delete(ctrlYorumlar.yorumSil);

module.exports = router;