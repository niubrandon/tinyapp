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


app.post("/urls/new", (req, res) => {
  urlDatabase[generateRandomString()] = {
    userID: req.cookies.userID,
    longURL: req.body.longURL
  };

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  
  const templateVars = {
    urls: urlDatabase
  };

  if (req.cookies.userID !== undefined) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
    templateVars.urls = urlsForUser(urlDatabase, req.cookies.userID);
    console.log("filtered data is", templateVars.urls);
    res.render("urls_index", templateVars);
  } else {
    //user not logged in
    templateVars.userID = undefined;
    templateVars["email"] = undefined;
    return res.status(401).send("you should log in first or register an account. redirect to login pages");
    
  }
 
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

app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("email and password required");
  }

  if (findUsers(usersDatabase, req.body.email)) {
   
    return res.status(400).send("email is taken");
  } else {

    let email = req.body.email;
    let password = req.body.password;
    let userID = generateRandomString();
    usersDatabase[userID] = {
      userID,
      email,
      password
    };

    res.cookie("userID", userID);

  }

  res.redirect("/urls");
  
});


app.post("/urls/:shortURL/update", (req, res) => {
  
  if (req.cookies.userID !== undefined) {
    //update here if it matches userID
    const uID = req.cookies.userID;
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
  if (req.cookies.userID !== undefined) {
    //delete here if it matches userID
    const uID = req.cookies.userID;
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
 
  };

  if (req.cookies) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
    templateVars["email"] = findUserEmail(usersDatabase, uID);
  
  }

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

 
  if (findUsers(usersDatabase, req.body.email)) {

    const userID = findUserFromEmail(usersDatabase, req.body.email);
    if (usersDatabase[userID].password === req.body.password) {

      res.cookie("userID", userID);
      res.redirect("/urls");
    } else {
      return res.status(403).send("password is wrong!");
    }
  } else {
    return res.status(403).send("email cannot be found!");
  }

});

app.post("/logout", (req, res) => {

  res.clearCookie("userID");
  res.redirect("/login");

});



app.get("/urls/:shortURL", (req, res) => {
 // shortURL is the name
 //console.log("shortURL is", req.params);
  const templateVars = {
    shortURL: req.params.shortURL,
    "longURL": ""};
  
  
  if (req.cookies.userID !== undefined) {
    const uID = req.cookies.userID;
    templateVars.userID = req.cookies.userID;
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

/* app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.render("/urls");
});
 */

//post update the updated url
//need fix here
app.post("/urls/:id", (req, res) => {
  //id is userID
  urlDatabase[req.params.id].longURL = req.body.updatedFullUrl;
  res.redirect("/urls");
});


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