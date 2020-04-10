const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');

const day = date.getDay();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,
  isChecked: Boolean
});

const listsSchema = new mongoose.Schema({
  name: String,
  foundItems: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listsSchema);

app.set("view engine", "ejs");

app.get("/", function(req, res) {

  const items = Item.find({}, function(err, foundItems) {
    if(err) {
      console.log(err);
    } else {
      res.render("list", { day: day, items: foundItems });
    }
  });

});

app.get("/:customListaName", function(req, res) {
  const customListaName = _.capitalize(req.params.customListaName);
  
  List.find({
        name: customListaName
      }, function (err, foundList) {
        // console.log(foundList);
        if(!err) {
          if (foundList.length) {
            // console.log("Existe!");
            res.render("list", {day: foundList[0].name, items: foundList[0].foundItems});

          } else {

            // console.log("Não Existe!");

            const list = new List({
              name: customListaName,
              item: []
            });

            list.save();

            res.redirect(`/${customListaName}`);
          }
        }
  });

  
});

app.get("/job", function (req, res) {

  res.render("list", { day: day, items: items });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  if(itemName.trim() != "") {

    const item = new Item({
      name: itemName,
      isChecked: false
    });

    if (listName == day) {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList) {
        console.log(foundList);
        foundList.foundItems.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  }

});

app.post("/delete", function(req, res) {

  const checkId = req.body.hiddenInput;
  const listName = req.body.listName;

  if (listName == day) {
    if (checkId) {

      Item.findByIdAndRemove({
        "_id": checkId
      }, function (err) {
        console.log("Deleted!");
      });

    }

    res.redirect("/");
  } else {

    console.log(checkId);

    if (checkId) {

      List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          foundItems: {
            _id: checkId
          }
        }
      }, function (err) {
        console.log("Deleted!");
      });

    }

    res.redirect("/" + listName);

  }

})

app.post("/check", function (req, res) {

  if (req.body.hiddenCheckInput) {

    var isCheckedFlag;

    Item.findOne({
      "_id": req.body.hiddenCheckInput
    }, function(err, item) {
      console.log(item);
      if(err) {
        console.log(err);
      } else {
        if (item['isChecked']) {
          Item.updateOne({
            "_id": req.body.hiddenCheckInput
          }, {
            "isChecked": false
          }, function (err) {
            console.log("Updated!");
          });

        } else {
          Item.updateOne({
            "_id": req.body.hiddenCheckInput
          }, {
            "isChecked": true
          }, function (err) {
            console.log("Updated!");
          });

        }
      }
    })

    
  }

  res.redirect("/");

})

app.listen(3000, function() {
  console.log("Server is ON!");
})

function setCurrentDay(currentDay) {
  switch (currentDay) {
    case 1: return "Monday"
      break;
    case 2: return "Tuesday"
      break;
    case 3: return "Wednesday"
      break;
    case 4: return "Thursday"
      break;
    case 5: return "Friday"
      break;
    case 6: return "Saturday"
      break;
    case 0: return "Sunday"
      break;
    default: return "ERROR!!! OMG..."
  }
}