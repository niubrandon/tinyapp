const findUsers = (objDB, userEmail) => {

  for (let user in objDB) {

    if (objDB[user]["email"] === userEmail) {
      return true;
    }

  }
  return false;
};

const getUserByEmail = (userEmail, objDB) => {
 
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

const generateRandomString = () => {
  const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += str[Math.floor(Math.random() * 61)];
  }
  return result;
};

module.exports = {findUsers, getUserByEmail, findUserEmail, urlsForUser, generateRandomString};