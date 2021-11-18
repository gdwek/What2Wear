
require('./db');
require('dotenv').config(); 


const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
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

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // const weatherURL = "http://dataservice.accuweather.com/locations/v1/postalcodes/search" + apiId + "&client_secret=" + apiSecret;
  // request(weatherURL, function(error, response, body){
  // let weather_json = JSON.parse(body);
  // const weather = {
  //     forecast : weather_json.response[0].periods[0].weather,
  //     temp: weather_json.response[0].periods[0].feelslikeF,
  //     icon : weather_json.response[0].periods[0].icon
  //   };
  res.render('index', {user: req.session.username, home: true});
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
  // console.log('hi');
  // console.log(req.session.username);
  User.findOne({username: req.session.username}).populate('outfits').exec(function(err, outfits) {
    console.log(outfits)
    res.render('view', {'outfits': outfits});
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
                  return res.render('error', {'message' : 'user does not exist'});
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

          new Outfit({
            user: user,
            top: req.body.top,
            bottom: req.body.bottom,
            jacket: req.body.jacket,
            scarf_gloves: req.body.scarf_gloves,
            temp: 67
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
        return res.send('an error occurred, please see the server logs for more information');
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