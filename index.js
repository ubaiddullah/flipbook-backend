const express = require("express");
require("express-async-errors");
const cors = require("cors");
const app = express();

app.use(cors());
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}`));
