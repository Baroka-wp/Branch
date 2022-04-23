var express = require('express');
const jquery = require( 'jquery');
var bodyParser=require("body-parser");
var app = express();
// Env
require('dotenv').config();
const {Schema}  = require("mongoose");
const MongoClient = require('mongoose');

let infosShema={
  name:String,
  phone: Number,
  email:String,
  sexe: String,
  nationality:String,
  niveauEtude: String,
  occupationActuelle: String,
  experienceProgramation: String,
  coursPrepa: String,
  disponibilite: String,
  exigence: String,
  niveauAnglais: String,
  bio: String
}

// Mongo db, nom de tcollection: infos
let Informations=MongoClient.model("infos",infosShema)

const uri = "mongodb+srv://ange_cluster_user:ange_cluster_user@cluster0.apamw.mongodb.net/Students?retryWrites=true&w=majority";
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// help getting body
let encodeUrl=bodyParser.urlencoded({extended:true})
app.use(bodyParser.urlencoded({extended: false}));

// indexing static files
app.use("/style",express.static(__dirname+"/style"));
app.use("/js",express.static(__dirname+"/js"));

// '/' est la route racine
app.get('/', function (req, res) {
  res.sendFile(__dirname+"/views/welcome.html");
});



// route inscription
app.get('/inscription', function (req, res) {
  console.log('salur')
  res.sendFile(__dirname+"/views/index.html");
});


// collect inscription data and save to mongodb database
app.post('/inscription',encodeUrl, function (req, res) {
 // res.sendFile(__dirname+"/views/index.html");

   var document=new Informations(req.body)
   console.log(document)
   document.save(function(err,data) {
     if(err){
       res.json({erreur: "Impossible de sauvegarder"});
     }else{
       res.json({ressit: "Informations envoyés avec success"});
     }
   });
   

});



//Unmatched routes handler
app.use(function (req, res) {
  if (req.method.toLowerCase() === "options") {
    res.end();
  } else {
    res.status(404).type("txt").send("Non trouvé");
  }
});

app.listen(4000, function () {
  console.log("Application écoute sur le port 4000 !");
});