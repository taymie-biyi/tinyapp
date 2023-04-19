//Import express
const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

//set up ejs view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

//database object containing urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//ADD ROUTES

//route to show all the urls in db
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//get request to create a submission form for new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//POST route to receive form and update url db
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const id = generateRandomString();
  // console.log(req.body);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);  //redirect to to new url
});

//route to display each URL and its shortened form based on its id
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL };
  res.render("urls_show", templateVars);
  // res.redirect(longURL);
});

//redirect short urls
app.get("/u/:id", (req, res) => {

  //Edge case - if id doesn't exist
  if (!urlDatabase[req.params.id]) {
    res.status(302).send('id does not exist');
    return;
  }
  const longURL = urlDatabase[req.params.id];
  
  res.redirect(longURL);
});

//POST request to delete url
//POST route to receive form and update url db
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
