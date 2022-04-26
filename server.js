var express = require('express');
var bodyParser=require("body-parser");
// upload dependances
const mfs=require('fs')
var mmulter=require("multer")
const mpath=require("path")

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


var storage = mmulter.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = mmulter({ storage: storage });


// help getting body
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
app.post('/inscription',upload.single("image"), function (req, res) {
     var obj = {
    name: req.body["email"],
    img: {
        data: mfs.readFileSync(mpath.join(__dirname + '/uploads/' + req.file.filename.split(".")[0])),
        contentType:req.file.mimetype
       }
    }
    
   var photo=new Image(obj)
   var document=new Informations(req.body)
   
   console.log(document)
     document.save(function(err,data) {
        if(err){
          res.json({erreur: "Impossible de sauvegarder"});
        }else{
          photo.save( function(err, item){
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




