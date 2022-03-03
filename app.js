require('./db');
require('dotenv').config(); 
console.log(process.env)

const express = require('express');
var request = require('request');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const bcrypt = require('bcryptjs');
console.log('before uri')
const uri = process.env.MONGODB_URI;
console.log('after uri')
mongoose.connect(uri, {useNewUrlParser: true}).then((x) => console.log('Connected to the DB')).catch(err => console.error('Error while connecting to DB', err));

const session = require('express-session');
const sessionOptions = {
    secret: process.env.SECRET_KEY,
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const User = mongoose.model('User');
const Outfit = mongoose.model('Outfit');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  if(req.session.username){
  User.findOne({username: req.session.username}, (err, user) => {
        if (!err && user){
          apiRetrieval(user, req, res, userOutfits);
        }
        else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
        }
        else {
          return res.render('error', {'message' : 'user does not exist'});
        }
  });
  }
  else {
    res.render('index', {home: true});
  } 
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/zipcode', (req, res) => {
  if(req.session.username){
    res.render('zipcode');
  }
  else {
    return res.render('error', {'message' : 'sorry, you have to log in to access this page.'});
  }
  });

app.get('/changedZipcode', (req, res) => {
  if(req.session.username){
    res.render('changedZipcode');
  }
  else {
    return res.render('error', {'message' : 'sorry, you have to log in to access this page.'});
  }
});

app.get('/manage', (req, res) => {
  if(req.session.username){
    res.render('manage');
  }
  else {
    return res.render('error', {'message' : 'sorry, you have to log in to access this page.'});
  }
});


app.get('/view', (req, res) => {
  if (req.session.username){
    User.findOne({username: req.session.username}).populate('outfits').exec(function(err, outfits) {
      if(outfits){
        res.render('view', {'outfits': outfits.outfits});
      }
      else if (err){
        console.log('error');
        return res.send('an error has occurred, please check the server output');
      }
    }) 
  }
  else {
    return res.render('error', {'message' : 'sorry, you have to log in to access this page.'});
  }
});



app.get("/logout", function(req, res) {
    req.session.destroy(() => {
     delete req.user 
     res.redirect("/"); 
    });
});

function apiRetrieval(user, req, res, callback){
      const locationsURL = "http://dataservice.accuweather.com/locations/v1/postalcodes/search?apikey=" + process.env.LOCATIONS_API_KEY + user.zipcode;
      request(locationsURL, function(error, response, body) {
              let weather_json = JSON.parse(body);
            const key =  weather_json[0].Key;
            const weatherURL = "http://dataservice.accuweather.com/currentconditions/v1/" + key + process.env.CURRENT_CONDITIONS_API_KEY;
            request(weatherURL, function(error, response, body) {
              let weather_json = JSON.parse(body);
              const temperature =  weather_json[0].Temperature.Imperial.Value;
              callback(temperature, user, req, res);
            }); 
      });
};

function userOutfits(temperature, user, req, res) {
  User.findOne({username: req.session.username}).populate('outfits').exec(function(err, outfits) {
    if(outfits){
      console.log('im over here!!!!');
      const lastDigit = temperature%10;
      console.log(lastDigit);
      if(lastDigit>= 0 && lastDigit<5){
        console.log("im here too")
        const compliment = 5-lastDigit;
        const suppliment = 5-compliment;
        outfits_in_range = outfits.outfits.filter( outfit => outfit.temp >= temperature-suppliment && outfit.temp < temperature+compliment);
        res.render('index', {user: user.username, temperature: temperature, outfits: outfits_in_range, home: true});
      }
      else if (lastDigit>5 && lastDigit <= 9){
        console.log('im here!!!!');
        const compliment = lastDigit-5;
        const suppliment = 5-compliment;
        outfits_in_range = outfits.outfits.filter( outfit => outfit.temp >= temperature-compliment && outfit.temp < temperature+suppliment);
  
        res.render('index', {user: user.username, temperature: temperature, outfits: outfits_in_range, home: true});
      }
     
    }
    else if (err){
      console.log('error');
      return res.send('an error has occurred, please check the server output');
    }
    else {
      res.render('index', {user: user.username, temperature: temperature, home: true});
    }
  }) 
};


function newOutfitWeather (temperature, user, req, res){
      new Outfit({
        user: user,
        top: req.body.top,
        bottom: req.body.bottom,
        jacket: req.body.jacket,
        scarf_gloves: req.body.scarf_gloves,
        temp: temperature
    }).save(function(err, outfit) {
        if(err){
            console.log(err);
            return res.send('an error has occurred, please check the server output');
        }
        //redirect
        else{
            user.outfits.push(outfit);
        }
        user.save();
        res.redirect('/');
    });
};


app.post('/login', (req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
      if (!err && user) {
          bcrypt.compare(req.body.password, user.password, (err, passwordMatch) => {
              if (passwordMatch){
                  req.session.regenerate((err) => {
                      if (!err) {
                          req.session.username = user.username; 
                          return res.redirect('/');
                      } 
                      else {
                          console.log(err); 
                          return res.send('an error occurred, please see the server logs for more information');
                      }
                  });
              }
              else if (!passwordMatch){
                  return res.render('error', {'message' : 'wrong password'});
              }
              else if (err){
                  console.log('error');
                  return res.send('an error has occurred, please check the server output');
              }
          });
      }
      else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
      }
      else {
          return res.render('error', {'message' : 'user does not exist'});
      }
  });
});


app.post('/signup', (req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
      if (!err && user) {
          return res.render('error', {'message' : 'user already exists'});
      }
      else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
      }
      if(req.body.username.length < 1){
        return res.render('error', {'message' : 'please enter a username'});
      } 
      if(req.body.password.length < 8){ //checking if password too short
        return res.render('errocr', {'message' : 'pw length issue'});
      }  
      var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(req.body.zipcode);
      if(!isValidZip){
        return res.render('error', {'message' : 'invalid zipcode'});
      }
      else {
          bcrypt.hash(req.body.password, 10, function(err, hash) {
              if(err){
                  console.log('error');
                  return res.send('an error has occurred, please check the server output');
              }
              else {
                  new User({
                      username: req.body.username,
                      password: hash,
                      zipcode: req.body.zipcode
                  }).save(function(err, user) {
                      if(err){
                          console.log('error');
                          return res.send('an error has occurred, please check the server output');
                      }
                      //redirect
                      // assuming that user is the user object just saved to the database
                      else{
                          req.session.regenerate((err) => {
                              if (!err) {
                                  req.session.username = user.username; 
                                  return res.redirect('/');
                              } 
                              else {
                                  console.log('error'); 
                                  return res.send('an error occurred, please see the server logs for more information');
                              }
                          });
                      }
                  });
                  
              }
          });
      }
      });
});

app.post('/zipcode', (req, res) => {
  User.findOne({username: req.session.username}, (err, user) => {
      if(!err && user){
        var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(req.body.zipcode);
        if(!isValidZip){
          return res.render('error', {'message' : 'invalid zipcode'});
        }
          req.session.regenerate((err) => {
              if (!err )  {
                  req.session.username = user.username; 
                  req.session.zipcode = req.body.zipcode;
                  user.zipcode = req.body.zipcode;
                  user.save(function(err, user) {
                    if(err){
                      console.log('error');
                      return res.send('an error has occurred, please check the server output');
                     }
                  //redirect
                  // assuming that user is the user object just saved to the database
                  else{
                    return res.render('changedZipcode', {'user' : user});
                  }

                  });
              } 
              else {
                  console.log(err); 
                  return res.send('an error occurred, please see the server logs for more information');
              }
          });
      }
      else if (!user){
          return res.render('error', {'message' : 'user does not exist'});
      }
      else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
      }
  });
});



app.post('/create', (req, res) => {
  User.findOne({username: req.session.username}, (err, user) => {
        if (!err && user){
          if(req.body.top.length<1){
            return res.render('error', {'message' : 'please enter a top'});
          }
          if(req.body.bottom.length<1){
            return res.render('error', {'message' : 'please enter a bottom'});
          }
          if (req.body.jacket == 'yes'){
            req.body.jacket = true;
          }
          else {
            req.body.jacket = false;
          }
          if (req.body.scarf_gloves == 'yes'){
            req.body.scarf_gloves = true;
          }
          else {
            req.body.scarf_gloves = false;
          }
        apiRetrieval(user, req, res, newOutfitWeather);
        }
        else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
      }
      else {
          return res.render('error', {'message' : 'user does not exist'});
      }
    });
});

app.post('/delete', (req, res) => {
  Outfit.deleteOne({ _id: req.body.outfitID }, function(err) {
      if (err){
        console.log(err); 
        return res.render('error', {'message' : 'invalid ID'});
      }
      else {
        return res.redirect("/");
      }
  });
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);