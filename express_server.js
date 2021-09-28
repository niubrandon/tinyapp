const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += str[Math.floor(Math.random() * 61)];
  }
  return result;
};

const urlDatabase =  {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //if there is a userlogin

  //fix logic here
  const templateVars = {
    urls: urlDatabase,
    username: ""
  };
  console.log("read the cookies", req.cookies);
 

  //not using signedCookies here
  //console.log("signed cookies:", req.signedCookies);
  if (req.cookies) {
    templateVars.username = req.cookies.username;
  }
  //if there is not
  
  console.log("printing the templateVars", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log("updated databse", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  res.send("OK");
});

app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});

//redirect when clicked the update button
app.post("/urls/:shortURL/update", (req, res) => {
  console.log("urls from post update", req.params.shortURL);
  //redirect to urls_show
  res.redirect(`/urls/${req.params.shortURL}`);
});

//redirect when clicked the delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("urls from post delete", req.params["shortURL"]);
  //delete
  delete urlDatabase[req.params["shortURL"]];

  console.log("deleted:", urlDatabase);
  res.redirect("/urls");
});

//post update the updated url
app.post("/urls/:id", (req, res) => {
  console.log("post the updated the URL link", req.params, req.body.updatedFullUrl);
  //update database
  urlDatabase[req.params.id] = req.body.updatedFullUrl;
  res.redirect("/urls");
});

//post user login
app.post("/login", (req, res) => {
// console.log("post inoformation from user login",req.body.username);

//set the cookie named username to the value submitted in the request body via login form after our server has set the cookie 
  res.cookie("username", req.body.username);

  // Cookies that have been signed
 
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //update the data to ""
  urlDatabase.username = "";
  //clear cookies
  res.clearCookie('username');
  res.redirect("/urls");

});

app.get("/urls/:shortURL", (req, res) => {
  //req.params
  console.log("shortURL", req.params.shortURL);
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("re-read from u", req.params);
  const longURL = urlDatabase[req.params.shortURL];
  console.log("longURL is:", longURL);
  res.redirect(longURL);
});


//
app.get("/urls/:id", (req, res) => {

  res.render("urls_new");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});