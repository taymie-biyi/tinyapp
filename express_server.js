//Import express
const express = require("express");

const cookieParser = require('cookie-parser');


const app = express();
const PORT = 8080; // default port 8080

//set up ejs view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//database object containing urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//database of users
const usersDb = {
  Sf5gyU: {
    id: "Sf5gyU",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  cD4nm0: {
    id: "cD4nm0",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Generate random 6char String
const generateRandomString = () => {
  let results = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characterLength = characters.length;
  for (let i = 0; i < 6; i++) {
    results += characters.charAt(Math.floor(Math.random() * characterLength));
  }
  return results;
};

//check if user exists function
const findUserByEmail = (email, usersDb) => {
  for (let userId in usersDb) {
    if (usersDb[userId].email === email) {
      return usersDb[userId];
    }
  }
  return false;
};

//ADD ROUTES

//get register
app.get("/register", (req, res) => {
  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (loggedInUser) {
    res.redirect("/urls");
    return;
  }
  
  res.render("register", {user: null});
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
  
  if (findUserByEmail(email, usersDb)) {
    //user exist
    res.status(400).send('Email address already in use!');
    return;
  }
  
  const userId = generateRandomString();

  usersDb[userId] = {
    id: userId,
    email,
    password,
  };

  //set cookie
  res.cookie("user_id", userId);
  //redirect to /urls
  res.redirect("/urls");
});

//get login
app.get("/login", (req, res) => {
  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (loggedInUser) {
    res.redirect("/urls");
    return;
  }
  res.render("login", {user: null});
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

  //validation if user exist
  const user = findUserByEmail(email, usersDb);

  //check the paasword
  if (user && user.password === password) {
    //set cookie
    res.cookie("user_id", user.id);

    //redirect back to /urls
    res.redirect("/urls");
  } else {
    //error for incorrect credentials
    res.status(403).send("Email / Password incorrect! Please try again");
  }
});

//POST request to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//route to show all the urls in db
app.get("/urls", (req, res) => {
  //check if user is logged in
  const loggedInUser = usersDb[req.cookies["user_id"]];
  
  const templateVars = { urls: urlDatabase, user: loggedInUser };
  res.render("urls_index", templateVars);
});

//POST route to receive form and update url db
app.post("/urls", (req, res) => {
  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (!loggedInUser) {
    res.send("Please login or register to shorten URL!!");
    return;
  }

  //generate random id
  const id = generateRandomString();
  // console.log(req.body);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);  //redirect to to new url
});

//get request to create a submission form for new url
app.get("/urls/new", (req, res) => {
  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (!loggedInUser) {
    res.redirect("/login");
    return;
  }
  
  res.render("urls_new", {user: loggedInUser});
});

//route to display each URL and its shortened form based on its id
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }

  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (!loggedInUser) {
    res.redirect("/login");
    return;
  }

  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL, user: loggedInUser };
  res.render("urls_show", templateVars);
});

// POST request to update longURL
app.post("/urls/:id/", (req, res) => {
  if (req.body.longURL && urlDatabase[req.params.id] !== req.body.longURL) {
    urlDatabase[req.params.id] = req.body.longURL;
  }
  res.redirect("/urls");
});

//redirect short urls
app.get("/u/:id", (req, res) => {
  
  //Edge case - if id doesn't exist
  if (!urlDatabase[req.params.id]) {
    res.status(302).send('No url with provided id in our database');
    return;
  }
  const longURL = urlDatabase[req.params.id];
  
  res.redirect(longURL, {user: loggedInUser});
});

//POST request to delete url
app.post("/urls/:id/delete", (req, res) => {
  const loggedInUser = usersDb[req.cookies["user_id"]];
  if (!loggedInUser) {
    res.redirect("/login");
    return;
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
