const BANK = require("./index.js");
const express = require("express");
const app = express();

(async()=>{
    await BANK(app);
})();

app.listen(3000)