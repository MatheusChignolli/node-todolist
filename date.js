//jshint esversion:6

exports.getDate = function () {

    var today = new Date();

    var options = {
      weekday: "long",
      day: "numeric",
      month: "long"
    }

    var day = today.toLocaleDateString("pt-BR", options);

    return day;
  }

exports.getDay = function () {

    var today = new Date();

    var options = {
      weekday: "long",
    }

    var day = today.toLocaleDateString("pt-BR", options);

    return day;
  }



