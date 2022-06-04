var express = require('express');
var bodyParser=require("body-parser");
var countries=require("countries-list");
// upload dependances
const fs=require('fs')
var multer=require("multer")
const path=require("path")
// email pulgin
var nodemailer = require('nodemailer');

//mail functions
var transporter = nodemailer.createTransport({
  service: process.env.SERVICE_MAIL, // à definir dans .env
  auth: {
    user: process.env.EMAIL_ADDRESS,// à definir dans .env
    pass: process.env.EMAIL_PASSWORD// à definir dans .env
  }
});

// for only one person
function getMailOptions(recipients,message,subject) {
  var isHtml=message[0]=="<"
  var options={
    from:  process.env.EMAIL_ADDRESS,
    to: recipients,
    subject: subject,
    text: message,
    }
  isHtml? options['html']=message:options['text']=message
}


// sendMail function
function sendMails(to) {
  var mailOptions=getMailOptions(to, //ecrivez votre mail ici pour recevoir le mail
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  "BRANCH");
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      return error;
    } else {
      return 'Email sent: ';
    }
  });
}



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
  email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/,
      unique: true
    },
  sexe: String,
  nationality:String,
  niveauEtude: String,
  occupationActuelle: String,
  experienceProgramation: String,
  objectif: String,
  coursPrepa: String,
  disponibilite: String,
  exigence: String,
  niveauAnglais: String,
  bio: String
}
// Mongo db, nom de tcollection: infos
let Informations=MongoClient.model("infos2",infosShema)
let Image=MongoClient.model('images2',imageShema)

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
  res.render(__dirname+"/src/views/index.ejs",{data: countryNames,message:{success:"",error:"",warning:"",}, data2:{name:"",email:"", phone:"", sexe:"", nationality:""}});
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

// // route inscription
// app.get('/inscription', function (req, res) {
//   const countryCodes = Object.keys(countries.countries);
//   const countryNames = countryCodes.map(code => countries.countries[code].name);
//   console.log(countryNames);
//   res.render(__dirname+"/src/views/index.ejs",{data: countryNames});
// });


app.post('/inscription',upload.single("image"),  function (req, res) {
    var obj = {
    name: req.body["email"],
    img: {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename.split(".")[0])),
        contentType:req.file.mimetype
       }
    }

   var photo=new Image(obj)
   var document=new Informations(req.body)
   var errormsg="";
     document.save(function(err) {
        if(err){
          // console.log(err.keyValue)
          if(err.keyValue.hasOwnProperty("email")){
              errormsg="Email Existant";
          }
          else{
            errormsg="Impossible de sauvegarder"
          }
          res.render(__dirname+"/src/views/index.ejs",{data: countryNames,message:{error: errormsg,success:"",warning:"",}, data2: req.body});
        }else{
           photo.save( function(err){
            if (err) {
                console.log(err);
            }
        });

        // res.sendFile(__dirname+"/views/index.html");
        sendMails(req.body["email"]);
        res.render(__dirname+"/src/views/index.ejs",{data: countryNames,message:{success:"Inscription réussite. Nous vous avons envoyé un mail.",error:"",warning:"",}, data2:{name:"",email:"", phone:"", sexe:"", age:"", nationality:""} });

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
