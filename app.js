const express = require("express");
const bodyParser = require("body-parser");
const { request } = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const ItemsSchema = {
    name: String
};

const Item = mongoose.model("Item", ItemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: []
}

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){

        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err)
                } else {
                    console.log("Sucessfully saved to your db.")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listName: "Today", newItems: foundItems})
        }
    });
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listName: foundList.name, newItems: foundList.items})
            }
        }
    })

    
});

app.post("/", function(req, res){
    const itemName = req.body.newitem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
            item.save();
            res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


});

app.post("/delete", function(req, res){
    const itemId = mongoose.Types.ObjectId(req.body.checkbox.trim());
    const nomeLista = req.body.teste;

    if(nomeLista === "Today"){
        Item.findByIdAndRemove(itemId, function(err){
            if (!err){
                console.log(err);
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name: nomeLista}, {$pull: {items: {_id: itemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + nomeLista)
            }
        });
    }

    

    
});

app.listen(port, function(){
    console.log("Fumegante na porta 3k")
})