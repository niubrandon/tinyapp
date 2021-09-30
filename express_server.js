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
//urlDB
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
//usersDB
const usersDatabase = {
  "a1Xb7z": {
    userID: "a1Xb7z",
    email: "admin@tinyapp.com",
    password: "super-admin"
  },
  "z2Hc9a": {
    userID: "z2Hc9a",
    email: "support@tinyapp.com",
    password: "super-support"
  }
};

const findUsers = (objDB, userEmail) => {

  for (let user in objDB) {

    if (objDB[user]["email"] === userEmail) {
      return true;
    }

  }
  return false;
};

const findUserFromEmail = (objDB, userEmail) => {
 
  for (let user in objDB) {
   
    if (objDB[user]["email"] === userEmail) {
      return user;
    }
   
  }
  return false;
};

const findUserEmail = (objDB, userID) => {
  if (objDB[userID]) {
    return objDB[userID].email;
  }
  return false;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,

  };

  //check if the cookie has username in database
  if (req.cookies.userID !== undefined) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    console.log("render urls_new, has cookies", req.cookies.userID);
    return res.render("urls_new", templateVars);
  }
  console.log("user not logged in, redirect to user login");
  return res.redirect("/login");
});

//******might be a bug */
app.post("/urls/new", (req, res) => {
  //user must be logged in already to create new url
  console.log("create a new url", req.body);

  urlDatabase[generateRandomString()] = {
    userID: req.cookies.userID,
    longURL: req.body.longURL
  };
  console.log("updated database", urlDatabase);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  //everyone can visit urls list
  const templateVars = {
    urls: urlDatabase
  };

  if (req.cookies.userID !== undefined) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    
  } else {
    templateVars.userID = undefined;
    templateVars["email"] = undefined;
  }
  res.render("urls_index", templateVars);
});




//get registration page
app.get("/register", (req, res) => {
  //check cookie
  const templateVars = {
    urls: urlDatabase,
  };
  if (req.cookies) {
    const uID = req.cookies.userID;
 
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
   
  }
  res.render("urls_register", templateVars);
});
//create a function to check if the email is already in system
//looping through the usersDatabase


//post registration page
app.post("/register", (req, res) => {
  //retrieve information from post request
 
  //check if the email is valid in exist
  //if email and pass are empty strings, response 400
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email and password required");
  }

  if (findUsers(usersDatabase, req.body.email)) {
   
    return res.status(400).send("email is taken");
  } else {
    //create an userID
    let email = req.body.email;
    let password = req.body.password;
    let userID = generateRandomString();
    usersDatabase[userID] = {
      userID,
      email,
      password
    };

    //create a cookie with the userID
    res.cookie("userID", userID);

  }

  res.redirect("/urls");
  
});


app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  res.send("OK");
});

app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  if (req.cookies) {
    const uID = req.cookies.userID;
   
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
   
  }
  res.render("hello_world", templateVars);
});

//redirect when clicked the update button
app.post("/urls/:shortURL/update", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//redirect when clicked the delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//post update the updated url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.updatedFullUrl;
  res.redirect("/urls");
});

//created a new login page
app.get("/login", (req, res) => {
  //check cookie
  const templateVars = {
    urls: urlDatabase,
 
  };

  if (req.cookies) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
  
  }

  res.render("urls_login", templateVars);
});
//post user login ***need modification
app.post("/login", (req, res) => {
  //check if email address in system
 
  if (findUsers(usersDatabase, req.body.email)) {
    //if it is true, we have this, then ,check the
    const userID = findUserFromEmail(usersDatabase, req.body.email);
    if (usersDatabase[userID].password === req.body.password) {
      //create cookie with userID
      res.cookie("userID", userID);
      res.redirect("/urls");
    } else {
      return res.status(403).send("password is wrong!");
    }
  } else {
    return res.status(403).send("email cannot be found!");
  }
  //


  //res.redirect("/register");
});

app.post("/logout", (req, res) => {

  res.clearCookie("userID");
  res.redirect("/login");

});

app.get("/urls/:shortURL", (req, res) => {
 
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  if (req.cookies) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    
  }
  res.render("urls_show", templateVars);
});

/* app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.render("/urls");
});
 */

app.get("/u/:id", (req, res) => {

  const templateVars = {
    urls: urlDatabase,

  };
  console.log("reqparams", req.params.id);
  //check if id is included in the userDatabase key list
  if (!Object.keys(usersDatabase).includes(req.params.id)) {
    return res.status(401).send("user is not in the database");
  } else {
    // since userID in database, check if user is logged in or not
    if (req.cookies.user !== undefined) {
      const uID = req.cookies.userID;
      templateVars.userID = req.cookies.userID;
      templateVars["email"] = findUserEmail(usersDatabase, uID);
      res.render("urls_new",templateVars);
    } else {
      //not logged in, return to urls
      res.redirect("/urls");
    }
   
  }

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