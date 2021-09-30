const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const salt = bcrypt.genSaltSync(10);


const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['ottawa-5678', '1290-68-cookies']
}));


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
    password: "$2a$10$8xjXxE.Z3lbexVrCipNViuM1l7FaX13QbAP15KDsjyLglGicZn7PO"
  },
  "z2Hc9a": {
    userID: "z2Hc9a",
    email: "support@tinyapp.com",
    password: "$2a$10$uqIGARutpZC0EI0fplMnjOHLiCYmrSKVm8Bu8HQSpL0wbaKtgbjkm"
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

const urlsForUser = (urlDatabase, user) => {
  let result = {};
  for (let key in urlDatabase) {
    
    if (urlDatabase[key].userID === user) {
      result[key] = {
        "longURL"  : urlDatabase[key].longURL,
        "userID" : user
      };
    }
    
  }
  return result;
};


app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: null

  };

  //check if the cookie has username in database
  const uID = req.session.userID;
  if (uID) {
    
    templateVars.userID = uID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    console.log("render urls_new, has cookies", uID);
    return res.render("urls_new", templateVars);
  }
  console.log("user not logged in, redirect to user login");
  return res.redirect("/login");
});


app.post("/urls/new", (req, res) => {
  urlDatabase[generateRandomString()] = {
    userID: req.session.userID,
    longURL: req.body.longURL
  };

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  console.log("userDatabase", usersDatabase);
  const templateVars = {
    urls: urlDatabase
  };
  console.log("cookiesession", req.session.userID);
  const uID = req.session.userID;
  if (uID) {
    
    templateVars.userID = uID;
    templateVars.email = findUserEmail(usersDatabase, uID);
    templateVars.urls = urlsForUser(urlDatabase, uID);
    console.log("filtered data is", templateVars.urls);
    res.render("urls_index", templateVars);
  } else {
    //user not logged in
    templateVars.userID = null;
    templateVars["email"] = undefined;
    return res.status(401).send("you should log in first or register an account. redirect to login pages");
    
  }
 
});


//get registration page
app.get("/register", (req, res) => {
  //check cookie
  const templateVars = {
    urls: urlDatabase,
    userID: undefined
  };
  /* if (req.cookies) {
    const uID = req.cookies.userID;
 
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
   
  } */
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
    //use cookieSession
    req.session.userID = userID;
    //res.cookie("userID", userID);

  }

  res.redirect("/urls");
  
});


app.post("/urls/:shortURL/update", (req, res) => {
  const uID = req.session.userID;
  if (uID) {
    //update here if it matches userID

    if (urlDatabase[req.params.shortURL].userID === uID) {
      //redirect to update page
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      res.status(401).send("You can't update this one, it doesn't belong to you");
    }
   
  } else {
    res.status(401).send("you have to login first before any update");
  }
  res.redirect("/urls");

});


app.post("/urls/:shortURL/delete", (req, res) => {
  //check if it is user for delete
  const uID = req.session.userID;
  if (uID) {
    //delete here if it matches userID
    if (urlDatabase[req.params.shortURL].userID === uID) {
      delete urlDatabase[req.params.shortURL];
    } else {
      res.status(401).send("You can't delete this one, it doesn't belong to you");
    }
   
  } else {
    res.status(401).send("you have to login first before any delete or update");
  }
  res.redirect("/urls");
 
});
  
//created a new login page
app.get("/login", (req, res) => {
  //check cookie
  const templateVars = {
    urls: urlDatabase,
    userID: undefined
  };
  console.log("cookiesession", req.session.userID);
  
/*   if (req.session.userID) {
    const uID = req.session.userID;
    templateVars.userID = uID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
  
  }
 */
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

 
  if (findUsers(usersDatabase, req.body.email)) {

    const userID = findUserFromEmail(usersDatabase, req.body.email);
    //check password with bcrypt.comapreSync()
    const rawPassword = req.body.password;
    const hash = usersDatabase[userID].password;
    if (bcrypt.compareSync(rawPassword, hash)) {
      //user cookieSession
      req.session.userID = userID;
      //res.cookie("userID", userID);
      res.redirect("/urls");
    } else {
      return res.status(403).send("password is wrong!");
    }
  } else {
    return res.status(403).send("email cannot be found!");
  }

});

app.post("/logout", (req, res) => {

  req.session.userID = null;
  //res.clearCookie("userID");
  res.redirect("/login");

});



app.get("/urls/:shortURL", (req, res) => {
 // shortURL is the name
 //console.log("shortURL is", req.params);
  const templateVars = {
    shortURL: req.params.shortURL,
    "longURL": "",
    userID: undefined
  };

  const uID = req.session.userID;
  if (uID) {
    templateVars.userID = uID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    //check if longURL exists
    if (urlDatabase[req.params.shortURL]) {
      templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
      res.render("urls_show", templateVars);
    } else {
      //return error, this one doesn't exist
      res.status(401).send("This shortURL is not existed");
    }
    
    
  } else {
    res.status(410).send("login first");
  }
  
});

app.post("/urls/:shortURL", (req, res) => {

  urlDatabase[req.params.shortURL].longURL = req.body.updatedFullUrl;
  res.redirect("/urls");
});



app.get("/u/:", (req, res) => {

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



///

app.get("/", (req, res) => {
  res.send("Hello!");
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