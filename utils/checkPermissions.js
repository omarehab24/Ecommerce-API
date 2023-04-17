const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserID) => {
  /* console.log(requestUser);
console.log(resourceUserID);
console.log(typeof(resourceUserID)); */

  if (requestUser.role === "admin") return;
  if (requestUser.userID === resourceUserID.toString()) return;

  throw new CustomError.UnauthorizedError("Unauthorized!");
};

module.exports = checkPermissions;
