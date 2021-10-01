const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  c3A1il: {
    longURL: "https://www.mun.ca",
    userID: "a1Xb7z"
  },
  a99xJm: {
    longURL: "https://www.ut.com",
    userID: "a1Xb7z"
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("admin@tinyapp.com", usersDatabase);
    const expectedOutput = "a1Xb7z";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return false with invalid email', function() {
    const user = getUserByEmail("test@tinyapp.com", usersDatabase);
    const expectedOutput = false;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

});

describe('urlsForUser', function() {
  it('should return a short list that belogns to a specifc user', function() {
    const shortList = urlsForUser(urlDatabase, "a1Xb7z");
    const expectedOutput = {
      c3A1il: {
        longURL: "https://www.mun.ca",
        userID: "a1Xb7z"
      },
      a99xJm: {
        longURL: "https://www.ut.com",
        userID: "a1Xb7z"
      }
    };
    assert.deepEqual(shortList, expectedOutput);

  });

  it("should return empty object when a specific user doesn't have any shortURL", function() {
    const shortList = urlsForUser(urlDatabase, "z2Hc9a");
    const expectedOutput = {};
    assert.deepEqual(shortList, expectedOutput);
  });
});