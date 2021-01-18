var mongoose = require("mongoose");

var dbURI =
"mongodb+srv://mekan32:furkan.123@cluster0.vcajt.mongodb.net/mekan32?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", function () {
  console.log("Mongoose " + dbURI + " adresindeki veritabanına bağlandı\n");
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose bağlantı hatası\n: " + err);
});

mongoose.connection.on("disconnected", function (err) {
  console.log("Mongoose bağlantısı kesildi\n");
});

kapat = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log("Mongoose Kapatıldı\n " + msg);
    callback();
  });
};

process.once("SIGUSR2", function () {
  kapat("Nodemon kapatıldı\n", function () {
    process.kill(process.pid, "SIGUSR2");
  });
});

process.on("SIGINT", function () {
  kapat("Uygulama kapatıldı\n", function () {
    process.exit(0);
  });
});

process.on("SIGTERM", function () {
  kapat("Heroku kapatıldı\n", function () {
    process.exit(0);
  });
});

require("./mekansema");
