//Import express
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')
const { urlDatabase, usersDb, getUserByEmail, generateRandomString, urlsForUser } = require("./helper")

const app = express();
const PORT = 8080; // default port 8080

//set up ejs view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['khfd', '2r5y', 'i6kv', 'e9sm', '4k0h'],

  //Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ROUTES

//get register
app.get("/register", (req, res) => {
  let user = usersDb[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  } else {
    user = null;
  }
  
  res.render("register", { user });
});

//POST request to register
app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  
  //error message if email/password is empty
  if (!email || !password) {
    res.status(400).send("Please enter both email and password to register");
    return;
  }

  // validation
  // Check if user exists? => look for that email
  if (getUserByEmail(email, usersDb)) {
    //user exist
    res.status(400).send('Email address already in use!');
    return;
  }
  //hash password
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  
  const userId = generateRandomString();
  //input email and hashed password into userdb
  usersDb[userId] = {
    id: userId,
    email,
    hashPassword,
  };

  //redirect to /login to set cookie
  res.redirect("/login");
});

//get login
app.get("/login", (req, res) => {
  let user = usersDb[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  } else{
    user = null;
  }
  res.render("login", { user });
});

// POST request to set cookie for username & login
app.post("/login", (req, res) => {
  //check if user is logged in
  const { email, password } = req.body;

  //error message if email/password is empty
  if (!email || !password) {
    res.status(400).send("Please enter both email and password to login");
    return;
  }

  const user = getUserByEmail(email, usersDb);
  // check if user exists / password is the same
  if (!user || !(bcrypt.compareSync(password, user.hashPassword))) {
    //error for incorrect credentials
    res.status(403).send("Email / Password incorrect! Please try again");
    return;
  }
  //set cookie
  req.session.user_id = user.id;

  //redirect back to /urls
  res.redirect("/urls");
});

//POST request to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//route to show all the urls in db
app.get("/urls", (req, res) => {
  //check if user is logged in
  const currentUserID = req.session.user_id;
  const user = usersDb[currentUserID];
  const urls = urlsForUser(currentUserID);

  const templateVars = { urls, user, };
  res.render("urls_index", templateVars);
});

//POST route to receive form and update url db
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = usersDb[userID];
  const longURL = req.body.longURL;
  if (!user) {
    res.send("Please login or register to shorten URL!!");
    return;
  }
  //generate random id
  const id = generateRandomString();
  //Create a new url
  urlDatabase[id] = {longURL, userID, };
  res.redirect(`/urls/${id}`);  //redirect to the new url
});

//get request to create a submission form for new url
app.get("/urls/new", (req, res) => {
  const user = usersDb[req.session.user_id];
  if (!user) {
    res.redirect("/login");
    return;
  }
  
  res.render("urls_new", {user});
});

//route to display each URL and its shortened form based on its id
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }

  const currentUserID = req.session.user_id;
  const user = usersDb[currentUserID];
  if (!user) {
    res.redirect("/login");
    return;
  }

  if (urlDatabase[shortUrl].userID !== currentUserID) {
    res.send("Please log in to access url");
    return;
  }
  const longURL = urlDatabase[shortUrl].longURL;
  const templateVars = { id: shortUrl, longURL, user };
  res.render("urls_show", templateVars);
});

// Method overide request to edit/update longURL
app.put("/urls/:id/", (req, res) => {

  const currentUserID = req.session.user_id;
  const user = usersDb[currentUserID];
  const shortUrl = req.params.id;

  if (!user || (urlDatabase[shortUrl].userID !== currentUserID)) {
    res.send("Please log in to make changes to url");
    return;
  }

  if (!urlDatabase[shortUrl]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }

  if (req.body.longURL && urlDatabase[shortUrl].longURL !== req.body.longURL) {
    urlDatabase[shortUrl].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});

//redirect short urls
app.get("/u/:id", (req, res) => {
  //Edge case - if id doesn't exist
  const shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }
  const longURL = urlDatabase[shortUrl].longURL;
  
  res.redirect(longURL);
});

//Method-overide request to delete url
app.delete("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  const currentUserID = req.session.user_id;
  const user = usersDb[currentUserID];
  if (!user || (urlDatabase[shortUrl].userID !== currentUserID)) {
    res.send("Please log in to make changes to url");
    return;
  }

  if (!urlDatabase[shortUrl]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }

  delete urlDatabase[shortUrl];
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});