var express = require('express');
var bodyParser=require("body-parser");
var countries=require("countries-list");
// upload dependances
const fs=require('fs')
var multer=require("multer")
const path=require("path")

var app = express();
// Env
require('dotenv').config();
const MongoClient = require('mongoose');

let imageShema = {
     name:String,
     img: {data:Buffer,contentType:String},
  }
let infosShema = {
  name:String,
  age:Number,
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
let Image=MongoClient.model('images',imageShema)

const uri =process.env.DATABASE_URL;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });


// help getting body
app.use(bodyParser.urlencoded({extended: false}));

// indexing static files
app.use("/src/style",express.static(__dirname+"/src/style"));
app.use("/src/image",express.static(__dirname+"/src/image"));
app.use("/src/js",express.static(__dirname+"/src/js"));

// '/' est la route racine
app.get('/welcome', function (req, res) {
  res.render(__dirname+"/src/views/welcome.ejs");
});
app.get("/dashboard/:page",function(req,res) {
    var perPage = 20
    var page = req.params.page || 1

    Informations
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, personFound) {
          Informations.count().exec(function(err, count) {
                if (err) return err
                res.render(__dirname+"/src/views/dashboard.ejs", {
                    data:personFound,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        });

})
const countryCodes = Object.keys(countries.countries);
  const countryNames = countryCodes.map(code => countries.countries[code].name);
// route inscription
app.get('/inscription', function (req, res) {
  res.render(__dirname+"/src/views/index.ejs",{data: countryNames,message:{success:"",error:"",warning:""}});
});
// route tableau de bord
app.get("/:page?",function(req,res) {
    var perPage = 20
    var page = req.params.page || 1

    Informations
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, personFound) {
          Informations.count().exec(function(err, count) {
                if (err) return err
                res.render(__dirname+"/src/views/hello.ejs", {
                    data:personFound,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        });

})

// route inscription
app.get('/inscription', function (req, res) {
  const countryCodes = Object.keys(countries.countries);
  const countryNames = countryCodes.map(code => countries.countries[code].name);
  console.log(countryNames);
  res.render(__dirname+"/src/views/index.ejs",{data: countryNames});
});


// collect inscription data and save to mongodb database
app.post('/src/inscription',upload.single("image"),  function (req, res) {
     var obj = {
    name: req.body["email"],
    img: {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename.split(".")[0])),
        contentType:req.file.mimetype
       }
    }

   var photo=new Image(obj)
   var document=new Informations(req.body)

     document.save(function(err) {
        if(err){
          res.json({erreur: "Impossible de sauvegarder"});
        }else{
           photo.save( function(err){
            if (err) {
                console.log(err);
            }
        });

        // res.sendFile(__dirname+"/views/index.html");
       res.json({informations: document,commentaire: "Informations envoyés avec success"});

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
