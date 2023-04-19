const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  let results = '';
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  characterLength = characters.length;
  for (let i = 0; i < 6; i++) {
    results += characters.charAt(Math.floor(Math.random() * characterLength))
  }
  return results;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // const templateVars = { id: req.params.id, longURL: longURL };
  // res.render("urls_show", templateVars);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const id = generateRandomString();
  // console.log(req.body);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
