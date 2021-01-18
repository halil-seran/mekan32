var express = require("express");
var request = require("postman-request");

var apiSecenekleri = {
  sunucu: "https://furkanmetinoguz1521012091.herokuapp.com",
  apiYolu: "/api/mekanlar/",
};

var mesafeyiFormatla = function (mesafe) {
  var yeniMesafe, birim;
  if (mesafe > 1000) {
    yeniMesafe = parseFloat(mesafe / 1000).toFixed(2);
    birim = " km";
  } else {
    yeniMesafe = parseFloat(mesafe).toFixed(1);
    birim = " m";
  }
  return yeniMesafe + birim;
};

var anasayfayiOlustur = function (req, res, cevap, mekanListesi) {
  var mesaj;
  if (!(mekanListesi instanceof Array)) {
    mesaj = "API HATASI: Birşeyler Ters Gitti";
    mekanListesi = [];
  } else {
    if (!mekanListesi.length) {
      mesaj = "Civarda Herhangi Bir mekan Bulunamadı!";
    }
  }

  res.render("mekanlar-liste", {
    baslik: "mekan32",
    sayfaBaslik: {
      siteAd: "mekan32",
      aciklama: "Isparta civarındaki mekanları keşfedin!",
    },
    mekanlar: mekanListesi,
    mesaj: mesaj,
    cevap: cevap,
  });
};

const anaSayfa = function (req, res) {
  var istekSecenekleri = {
    url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu,
    method: "GET",
    json: {},
    qs: {
      enlem: req.query.enlem,
      boylam: req.query.boylam,
    },
  };
  request(istekSecenekleri, function (hata, cevap, mekanlar) {
    var i, gelenmekanlar;
    gelenmekanlar = mekanlar;
    if (!hata && gelenmekanlar.length) {
      for (i = 0; i < gelenmekanlar.length; i++) {
        gelenmekanlar[i].mesafe = mesafeyiFormatla(gelenmekanlar[i].mesafe);
      }
    }
    anasayfayiOlustur(req, res, cevap, gelenmekanlar);
  });
};

var detaySayfasiOlustur = function (req, res, mekanDetaylari) {
  res.render("mekan-detay", {
    baslik: mekanDetaylari.ad,
    sayfaBaslik: mekanDetaylari.ad,
    mekanBilgisi: mekanDetaylari,
  });
};

var hataGoster = function (req, res, durum) {
  var baslik, icerik;
  if ((durum = 404)) {
    baslik = "404, Sayfa Bulunamadı!";
    icerik = "Kusura bakma sayfayı bulamadık!";
  } else {
    baslik = durum + ", Birşeyler Ters Gitti!";
    icerik = "Ters Giden Birşey Var";
  }
  res.status(durum);
  res.render("hata", {
    baslik: baslik,
    icerik: icerik,
  });
};

var mekanBilgisiGetir = function (req, res, callback) {
  var istekSecenekleri = {
    url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu + req.params.mekanid,
    method: "GET",
    json: {},
  };
  request(istekSecenekleri, function (hata, cevap, mekanDetaylari) {
    var gelenmekan = mekanDetaylari;
    if (cevap.statusCode == 200) {
      gelenmekan.koordinatlar = {
        enlem: mekanDetaylari.koordinatlar[0],
        boylam: mekanDetaylari.koordinatlar[1],
      };
      callback(req, res, gelenmekan);
    } else {
      hataGoster(req, res, cevap.statusCode);
    }
  });
};

const mekanBilgisi = function (req, res, callback) {
  mekanBilgisiGetir(req, res, function (req, res, cevap) {
    detaySayfasiOlustur(req, res, cevap);
  });
};

var yorumSayfasiOlustur = function (req, res, mekanBilgisi) {
  res.render("yorum-ekle", {
    baslik: mekanBilgisi.ad + " mekanına Yorum Ekle",
    sayfaBaslik: mekanBilgisi.ad + " mekanına Yorum Ekle",
    hata: req.query.hata,
  });
};

const yorumEkle = function (req, res) {
  mekanBilgisiGetir(req, res, function (req, res, cevap) {
    yorumSayfasiOlustur(req, res, cevap);
  });
};

const yorumumuEkle = function (req, res) {
  var istekSecenekleri, gonderilenYorum, mekanid;
  mekanid = req.params.mekanid;
  gonderilenYorum = {
    yorumYapan: req.body.name,
    puan: parseInt(req.body.rating, 10),
    yorumMetni: req.body.review,
  };
  istekSecenekleri = {
    url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu + mekanid + "/yorumlar",
    method: "POST",
    json: gonderilenYorum,
  };
  if (
    !gonderilenYorum.yorumYapan ||
    !gonderilenYorum.puan ||
    !gonderilenYorum.yorumMetni
  ) {
    res.redirect("/mekan/" + mekanid + "/yorum/yeni?hata=evet");
  } else {
    request(istekSecenekleri, function (hata, cevap, body) {
      if (cevap.statusCode === 201) {
        res.redirect("/mekan/" + mekanid);
      } else if (
        cevap.statusCode === 400 &&
        body.name &&
        body.name === "ValidationError"
      ) {
        res.redirect("/mekan/" + mekanid + "/yorum/yeni?hata=evet");
      } else {
        hataGoster(req, res, cevap.statusCode);
      }
    });
  }
};

module.exports = {
  anaSayfa,
  mekanBilgisi,
  yorumEkle,
  yorumumuEkle,
};
