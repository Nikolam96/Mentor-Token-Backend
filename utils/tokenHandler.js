const { expressjwt } = require("express-jwt");

const tokenHandler = expressjwt({
  algorithms: ["HS256"],
  secret: process.env.JWT_SECRET,
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    }
    if (req.cookies.jwt) {
      return req.cookies.jwt;
    }
    return null;
  },
}).unless({
  path: ["/api/v1/signup", "/api/v1/login", "/api/v1/checkEmail"],
});

module.exports = tokenHandler;
