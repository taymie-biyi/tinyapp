
//database object containing urls
const urlDatabase = {};

//database of users
const usersDb = {};

//check if user exists function
const getUserByEmail = (email, usersDb) => {
  for (let user in usersDb) {
    if (usersDb[user].email === email) {
      return usersDb[user];//return user object
    }
  }
  return null;
};

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

//check for current user's urls
const urlsForUser = (id) => {
  const userUrls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userUrls[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return userUrls;
};

module.exports = { 
  urlDatabase,
  usersDb,
  getUserByEmail,
  generateRandomString,
  urlsForUser
};