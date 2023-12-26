const axios = require("axios").default;

module.exports = axios.create({
  baseURL: "https://api.acikkuran.com/",
});
