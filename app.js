require('./db');
require('dotenv').config(); 


const express = require('express');
const request = require("request");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const connectEnsureLogin = require('connect-ensure-login'); 
const flash = require('connect-flash');
const mongoose  = require('mongoose');
const bcrypt = require('bcryptjs');
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {useNewUrlParser: true}).then((x) => console.log('Connected to the DB')).catch(err => console.error('Error while connecting to DB', err));

// new window.JustValidate('.zipcode', {
//     Rules: {
//       zip: {
//         required: true,
//         zip: true
//       },
//     },
//     Messages: {
//       required: 'The field is required',
//     },
//     colorWrong: "#B81111"
// });

// enable sessions

const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { 
        return done(err); 
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.verifyPassword(password)) { 
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

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
  res.render('zipcode');
  });

app.get('/changedZipcode', (req, res) => {
  res.render('changedZipcode');
});

app.get('/manage', (req, res) => {
  res.render('manage');
});


app.get('/view', (req, res) => {
  User.findOne({username: req.session.username}).populate('outfits').exec(function(err, outfits) {
    if(outfits){
      res.render('view', {'outfits': outfits.outfits});
    }
    else if (err){
      console.log('error');
      return res.send('an error has occurred, please check the server output');
    }
  }) 
  // User.findOne({username: req.session.username}, (err, user) => {
  //   if(err){
  //     console.log('error');
  //     return res.send('an error has occurred, please check the server output');
  //   }
  //   else if (user){
  //     console.log('here i am');
  //     user.populate('outfits').exec(function(err, outfits) {
  //       res.render('view', {outfits: outfits});
  //     }) 

  //     }
  //   //   const outfits_local = [];
  //   //   user.outfits.forEach((value, array) => {
  //   //     Outfit.findOne({_id: value}, (err, outfit) => {
  //   //       if(err){
  //   //         console.log('error');
  //   //         return res.send('an error has occurred, please check the server output');
  //   //       }
  //   //       else if (outfit){
  //   //         outfits_local.push(outfit);
  //   //         console.log('[ushed outfit')
  //   //       }
  //   //       else {
  //   //         console.log('no outfits');
  //   //       }
  //   //     });
  //   //   });
  //   //   res.render('view', {outfits: outfits_local});
  //   // }
  //   // else if (!err && !user){
  //   //   console.log('hi');
  //   // }
    // else {
    //   return res.render('error', {'message' : 'user does not exist'});
    // }
  //});
});



app.get("/logout", function(req, res) {
    req.session.destroy(() => {
     delete req.user 
     res.redirect("/"); 
    });
});

function apiRetrieval(user, req, res, callback){
      const locationsURL = "http://dataservice.accuweather.com/locations/v1/postalcodes/search?apikey=QFHUQmXwDaHJ1lqAlP4CTtDATkFA8RcG&q=" + user.zipcode;
      request(locationsURL, function(error, response, body) {
            let weather_json = JSON.parse(body);
            const key =  weather_json[0].Key;
            const weatherURL = "http://dataservice.accuweather.com/currentconditions/v1/" + key + "?apikey=QFHUQmXwDaHJ1lqAlP4CTtDATkFA8RcG";
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
      const lastDigit = temperature%10;
      const compliment = 5-lastDigit;
      const suppliment = 5-compliment;
     // const lastDigits = outfits.outfits.map(outfit => outfit.temp%10);
     
        outfits_in_range = outfits.outfits.filter( outfit => outfit.temp >= temperature-suppliment && outfit.temp <= temperature+compliment);
      res.render('index', {user: user.username, temperature: temperature, outfits: outfits_in_range, home: true});
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

// function renderWeather(temperature, user, req, res){
//   res.render('index', {user: user.username, temperature: temperature, home: true});
// }
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

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
// app.post('/login', (req, res) => {
//   User.findOne({username: req.body.username}, (err, user) => {
//       if (!err && user) {
        
//       //   passport.authenticate('local', function(err, user, info) {
//       //     if (err) { 
//       //       console.log(err); 
      //       return res.send('an error occurred, please see the server logs for more information');
      //     }
      //     if (!user) { 
      //       return res.redirect('/login'); 
      //     }
      //     req.logIn(user, function(err) {
      //       if (err) { 
      //         console.log(err); 
      //         return res.send('an error occurred, please see the server logs for more information');
      //       }
      //       req.session.username = user.username; 
      //       return res.redirect('/');
      //     });
      //   })(req, res, next);
      // }
      else if (err){
          console.log('error');
          return res.send('an error has occurred, please check the server output');
      }
      else {
          return res.render('error', {'message' : 'user does not exist'});
      }


  //         bcrypt.compare(req.body.password, user.password, (err, passwordMatch) => {
  //             if (passwordMatch){
  //                 req.session.regenerate((err) => {
  //                     if (!err) {
  //                         req.session.username = user.username; 
  //                         return res.redirect('/');
  //                     } 
  //                     else {
  //                         console.log(err); 
  //                         return res.send('an error occurred, please see the server logs for more information');
  //                     }
  //                 });
  //             }
  //             else if (!passwordMatch){
  //                 return res.render('error', {'message' : 'user does not exist'});
  //             }
  //             else if (err){
  //                 console.log('error');
  //                 return res.send('an error has occurred, please check the server output');
  //             }
  //         });
  //     }
  //     else if (err){
  //         console.log('error');
  //         return res.send('an error has occurred, please check the server output');
  //     }
  //     else {
  //         return res.render('error', {'message' : 'user does not exist'});
  //     }
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
      if(req.body.password.length < 8){ //checking if password too short
          return res.render('error', {'message' : 'pw length issue'});
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
          req.session.regenerate((err) => {
              if (!err) {
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
  //console.log(req.session.username);
  User.findOne({username: req.session.username}, (err, user) => {
        if (!err && user){
          console.log(req.body);
          //console.log(req.body.scarf_gloves);
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