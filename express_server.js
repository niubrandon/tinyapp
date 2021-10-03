const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const salt = bcrypt.genSaltSync(10);
const { findUsers, getUserByEmail, findUserEmail, urlsForUser, generateRandomString } = require('./helpers');


const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['ottawa-5678', '1290-68-cookies']
}));
app.use(methodOverride('_method'));


//urlDB
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visits: 1
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visits: 1
  },
  c3A1il: {
    longURL: "https://www.mun.ca",
    userID: "a1Xb7z",
    visits: 1
  },
  a99xJm: {
    longURL: "https://www.ut.com",
    userID: "a1Xb7z",
    visits: 1
  }
};
//usersDB
const usersDatabase = {
  "a1Xb7z": {
    userID: "a1Xb7z",
    email: "admin@tinyapp.com",
    password: "$2a$10$8xjXxE.Z3lbexVrCipNViuM1l7FaX13QbAP15KDsjyLglGicZn7PO"
  },
  "z2Hc9a": {
    userID: "z2Hc9a",
    email: "support@tinyapp.com",
    password: "$2a$10$uqIGARutpZC0EI0fplMnjOHLiCYmrSKVm8Bu8HQSpL0wbaKtgbjkm"
  }
};


app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: null,
    email: null

  };

  const uID = req.session.userID;
  if (uID) {
    templateVars.userID = uID;
    templateVars.email = findUserEmail(usersDatabase, uID);
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});


app.post("/urls/new", (req, res) => {
  urlDatabase[generateRandomString()] = {
    userID: req.session.userID,
    longURL: req.body.longURL,
    visits: 1
  };

  res.redirect("/urls");
});


app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    userID: null,
    email: null,

  };

  const uID = req.session.userID;

  if (uID) {
    templateVars.userID = uID;
    templateVars.email = findUserEmail(usersDatabase, uID);
    templateVars.urls = urlsForUser(urlDatabase, uID);
    res.render("urls_index", templateVars);
  } else {

    return res.status(401).send("you should log in first or register an account.");
  }
});



app.get("/register", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    userID: undefined
  };
  const uID = req.session.userID;
  if (uID) {
    res.redirect('/urls');
  }
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email and password required");
  }

  if (findUsers(usersDatabase, req.body.email)) {
   
    return res.status(400).send("email is taken");
  } else {

    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, salt);
    let userID = generateRandomString();
    usersDatabase[userID] = {
      userID,
      email,
      password
    };
   
    req.session.userID = userID;

  }

  res.redirect("/urls");
  
});

//validate
app.post("/urls", (req, res) => {
  const uID = req.session.userID;
  if (uID) {
    const randomURL = generateRandomString();
    urlDatabase[randomURL] = {
      userID: uID,
      longURL: null
    };
    res.redirect(`/urls/${randomURL}`);
  } else {
    res.status(401).send("you need to login first");
  }
});

//Restful app.delete()
app.post("/urls/:id/delete", (req, res) => {
  const uID = req.session.userID;
  if (uID) {
    if (urlDatabase[req.params.id].userID === uID) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.status(401).send("You can't delete this one, it doesn't belong to you");
    }
   
  } else {
    res.status(401).send("you have to login first before any delete or update");
  }
 
});
  

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: undefined,
  };

  const uID = req.session.userID;
  if (uID) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

 
  if (findUsers(usersDatabase, req.body.email)) {

    const userID = getUserByEmail(req.body.email, usersDatabase);
    const rawPassword = req.body.password;
    const hash = usersDatabase[userID].password;
    if (bcrypt.compareSync(rawPassword, hash)) {
      req.session.userID = userID;
      res.redirect("/urls");
    } else {
      return res.status(403).send("password is wrong!");
    }
  } else {
    return res.status(403).send("email cannot be found!");
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");

});


app.get("/urls/:id", (req, res) => {

  const templateVars = {
    shortURL: req.params.id,
    longURL: null,
    userID: null,
    visits: 0
  
  };

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.status(401).send("This shortURL is not exist!");
  }

  const uID = req.session.userID;
  if (uID) {
    templateVars.userID = uID;
    templateVars.email = findUserEmail(usersDatabase, uID);

    if (urlDatabase[req.params.id].userID === uID) {
      templateVars.longURL = urlDatabase[req.params.id].longURL;
      templateVars.userID = uID;
      templateVars.visits = urlDatabase[req.params.id].visits + 1;
      urlDatabase[req.params.id].visits = templateVars.visits;
      
      res.render("urls_show", templateVars);
    } else {
      res.status(401).send("The user doesn't own this shortURL");
    }
     
  } else {
    res.status(401).send("login first");
  }
  
});


app.post("/urls/:id", (req, res) => {

  const uID = req.session.userID;
  if (uID) {

    if (urlDatabase[req.params.id].userID === uID) {
      urlDatabase[req.params.id].longURL = req.body.updatedFullUrl;
      res.redirect('/urls');
    } else {
      res.status(401).send("You can't delete this one, it doesn't belong to you");
    }
   
  } else {
    res.status(401).send("you have to login first before you modify the url");
  }
  res.redirect("/urls");

 
});

//Restful app.put()
app.post("/urls/:shortURL/update", (req, res) => {
  const uID = req.session.userID;
  if (uID) {

    if (urlDatabase[req.params.shortURL].userID === uID) {
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      res.status(401).send("You can't update this one, it doesn't belong to you");
    }
   
  } else {
    res.status(401).send("you have to login first before any update");
  }
  res.redirect("/urls");

});



app.get("/u/:id", (req, res) => {
  console.log("redirect url", req.params.id, urlDatabase[req.params.id].longURL, !Object.keys(urlDatabase).includes(req.params.id));
  console.log("database",urlDatabase);
  let lURL = urlDatabase[req.params.id].longURL;
  if (lURL.startsWith("http://") || lURL.startsWith("https://")) {
    //valid full url
  } else {
    lURL = "https://" + lURL;
  }
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.status(401).send("This shortURL is not exist!");
  } else {

    res.redirect(lURL);
  }
  
});


app.get("/", (req, res) => {
  
  const uID = req.session.userID;
  if (uID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

