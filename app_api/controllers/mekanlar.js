var mongoose = require("mongoose");
var mekan = mongoose.model("mekan");

const cevapOlustur = function (res, status, content) {
  res.status(status).json(content);
};

const mekanlariListele = async (req, res) => {
  var boylam = parseFloat(req.query.boylam);
  var enlem = parseFloat(req.query.enlem);

  var nokta = {
    type: "Point",
    coordinates: [enlem, boylam],
  };

  var geoOptions = {
    distanceField: "mesafe",
    spherical: true,
    key: "koordinatlar",
  };

  if (!enlem || !boylam) {
    cevapOlustur(res, 404, "Enlem ve boylam zorunlu parametreler");
    return;
  }

  try {
    const sonuc = await mekan.aggregate([
      {
        $geoNear: {
          near: nokta,
          ...geoOptions,
        },
      },
    ]);
    const mekanlar = sonuc.map((mekan) => {
      return {
        _id: mekan._id,
        ad: mekan.ad,
        adres: mekan.adres,
        puan: mekan.puan,
        imkanlar: mekan.imkanlar,
        mesafe: mekan.mesafe.toFixed(),
      };
    });

    cevapOlustur(res, 200, mekanlar);
  } catch (error) {
    console.log(error);
    cevapOlustur(res, 404, error);
  }
};

const mekanEkle = function (req, res) {
  mekan.create(
    {
      ad: req.body.ad,
      adres: req.body.adres,
      imkanlar: req.body.imkanlar.split(","),
      koordinatlar: [parseFloat(req.body.enlem), parseFloat(req.body.boylam)],
      saatler: [
        {
          gunler: req.body.gunler1,
          acilis: req.body.acilis1,
          kapanis: req.body.kapanis1,
          kapali: req.body.kapali1,
        },
        {
          gunler: req.body.gunler2,
          acilis: req.body.acilis2,
          kapanis: req.body.kapanis2,
          kapali: req.body.kapali2,
        },
      ],
    },
    function (hata, mekan) {
      if (hata) {
        cevapOlustur(res, 400, hata);
      } else {
        cevapOlustur(res, 201, mekan);
      }
    }
  );
};

const mekanGetir = function (req, res) {
  mekan.findById(req.params.mekanid).exec(function (hata, mekan) {
    if (!mekan) {
      cevapOlustur(res, 404, { durum: "mekanid bulunamadı" });
      return;
    } else if (hata) {
      cevapOlustur(res, 404, hata);
      return;
    }
    cevapOlustur(res, 200, mekan);
  });
};

const mekanGuncelle = function (req, res) {
  if (!req.params.mekanid) {
    cevapOlustur(res, 404, { mesaj: "Bulunamadı. mekanid gerekli." });
    return;
  }
  mekan.findById(req.params.mekanid)
    .select("-yorumlar -puan")
    .exec(function (hata, gelenmekan) {
      if (!gelenmekan) {
        cevapOlustur(res, 404, { durum: "mekanid bulunamadı" });
        return;
      } else if (hata) {
        cevapOlustur(res, 400, hata);
        return;
      }
      gelenmekan.ad = req.body.ad;
      gelenmekan.adres = req.body.adres;
      gelenmekan.imkanlar = req.body.imkanlar.split(",");
      gelenmekan.koordinatlar = [
        parseFloat(req.body.enlem),
        parseFloat(req.body.boylam),
      ];
      gelenmekan.saatler = [
        {
          gunler: req.body.gunler1,
          acilis: req.body.acilis1,
          kapanis: req.body.kapanis1,
          kapali: req.body.kapali1,
        },
        {
          gunler: req.body.gunler2,
          acilis: req.body.acilis2,
          kapanis: req.body.kapanis2,
          kapali: req.body.kapali2,
        },
      ];
      gelenmekan.save(function (hata, mekan) {
        if (hata) {
          cevapOlustur(res, 404, hata);
        } else {
          cevapOlustur(res, 200, mekan);
        }
      });
    });
};

const mekanSil = function (req, res) {
  var mekanid = req.params.mekanid;
  if (mekanid) {
    mekan.findByIdAndRemove(mekanid).exec(function (hata, gelenmekan) {
      if (hata) {
        cevapOlustur(res, 400, hata);
        return;
      }
      cevapOlustur(res, 204, null);
    });
  } else {
    cevapOlustur(res, 404, { mesaj: "mekanid bulunamadı" });
  }
};

module.exports = {
  mekanlariListele,
  mekanEkle,
  mekanGetir,
  mekanGuncelle,
  mekanSil,
};
