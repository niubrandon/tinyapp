
const findUserEmail = (objDB, userID) => {

  return objDB[userID].email;
};


const usersDatabase = {
  "a1Xb7z": {
    id: "a1Xb7z",
    email: "admin@tinyapp.com",
    password: "super-admin"
  },
  "z2Hc9a": {
    id: "z2Hc9a",
    email: "support@tinyapp.com",
    password: "super-support"
  }
};

console.log(findUserEmail(usersDatabase, "a1Xb7z"));