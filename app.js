//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery',false);
mongoose.connect("mongodb+srv://paletisaichandu:saichandu8897%40@cluster0.2dhf5dd.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={
   name:String
};

const Item =mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"EAT"
});
const item2=new Item({
  name:"SLEEP"
});
const item3=new Item({
  name:"STUDY"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(result.length==0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)console.log(err);
        else
        console.log("Successfully added");
      });
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: result});
  });


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today")
  {
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(listName==="Today")
    if(err)console.log(err);
    else
    console.log("Sucessfully deleted");
    res.redirect("/");
  })}
   else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,found){
      if(!err) res.redirect("/"+listName);
    })
   }

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  })
  if(listName==="Today")
  {item.save();res.redirect("/");}
  else
  {
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }

});

app.get("/:customListName", function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundlist){
  if(!err){
    if(!foundlist)
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else
    {
      res.render("list", {listTitle: customListName, newListItems: foundlist.items});
    }
  }})

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
