// Create a user token object with properties name, userID and role
const createTokenUser = (userObj) => {
  return {
    name: userObj.name,
    userID: userObj._id,
    role: userObj.role,
  };
};

module.exports = createTokenUser;
