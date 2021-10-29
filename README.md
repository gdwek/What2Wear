
# What2Wear 

## Overview

Ever find yourself opening the weather app, seeing "60 degrees and windy" and thinking, "Okay, but what the heck do I wear?" What2Wear is for you! 

What2Wear is a web app that will allow users to record what they have worn in the past for certain temperatures. Users can register and login. Once they're logged in, they can enter their location, and they will be told the current weather and what they wore when it was this weather in the past. If the user hasn't logged anything for that temperature range, they will be provided with a reccomendation of what to wear and prompted to log what they actually end up wearing that day for future purposes.


## Data Model

The application will store Users and Outfits

* users can have multiple outfits (via references)
* each outfit has a reference to the user, outfit data, and weather information


An Example User:

```javascript
{
  username: "gdwek",
  password: // a password string,
  outfits: // an array of references to Outfit documents
  zipcode: "10002"
}
```

An Example Outfit:

```javascript
{
  user: // a reference to a User object
  top: "t shirt",
  bottom: "skirt with tights"
  jacket: true
  scarf_gloves: false
  temp: 57
}
```


## [Link to Commented First Draft Schema](db.js) 


## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/home - home page

![home](documentation/home.png)

/signup - page to signup

![signup](documentation/home/signup.png)

/login - page to log in

![login](documentation/home/login.png)

/outfit - outfit page before user entered an outfit for that weather

![outfitB4](documentation/outfitInitial.png)

/outfit - outfit page when user has logged outfits for that weather

![outfitAfter](documentation/outfitPost.png)

/outfit/create - page to log an outfit

![create](documentation/outfit/create.png)

/outfit/zipcode - page to update location

![zipcode](documentation/outfit/zipcode.png)



## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

(___TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://www.mongodb.com/download-center?jmp=docs&_ga=1.47552679.1838903181.1489282706#previous)_)

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can create a new grocery list
4. as a user, I can view all of the grocery lists I've created in a single list
5. as a user, I can add items to an existing grocery list
6. as a user, I can cross off items in an existing grocery list

## Research Topics

(___TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed_)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit_)


## [Link to Initial Main Project File](app.js) 

(___TODO__: create a skeleton Express application with a package.json, app.js, views folder, etc. ... and link to your initial app.js_)

## Annotations / References Used

(___TODO__: list any tutorials/references/etc. that you've based your code off of_)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)

