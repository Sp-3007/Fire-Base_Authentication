const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const cred = require("./credential.json");
const userRoutes = require("./routes/user");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

admin.initializeApp({
  credential: admin.credential.cert(cred),
});

app.use("/user",userRoutes)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
