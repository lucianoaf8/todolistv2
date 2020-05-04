//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const itemsSchema = {
    name: String,
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({ name: "Welcome to your todo list!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- check this to mark an item done!" });
const defaultItems = [item1, item2, item3];

const day = date.getDate();

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Items inserted successfully!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Default - " + day,
                newListItems: foundItems,
            });
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;

    const item = new Item({
        name: itemName,
    });

    item.save();

    res.redirect("/");
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox.trim();

    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            console.log(err);
        } else {
            console.log("Item deleted successfully!");
        }
    });

    res.redirect("/");
});

app.get("/:paramName", function (req, res) {
    res.render("list", {
        listTitle:
            req.params.paramName.charAt(0).toUpperCase() +
            req.params.paramName.slice(1) +
            " - " +
            day,
        newListItems: defaultItems,
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
