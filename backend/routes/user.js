const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authenticate_user");
const admin = require("firebase-admin");


// Register route with middleware
router.post("/register", authentication , async (req, res) => {
  let customClaims = {};
  const decodedToken =req.decodedToken;
  const userType = req.body.userType;
  console.log(userType)
  if (userType === "diagnosticCenter") { 
    customClaims = { role: "diagnostic_center" };
  } else if (userType === "user") {
    customClaims = { role: "normal_user" };
  }
  await admin.auth().setCustomUserClaims(decodedToken.uid, customClaims);
  console.log(`User with UID '${decodedToken.uid}' has assigned a role of ${userType}`);

  res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
});

router.get("/login",authentication,async (req,res)=>{
  
  const userRecord = await admin.auth().getUser(req.decodedToken.uid);
   try {
     const customClaims = userRecord.customClaims;

     if (customClaims && customClaims.role) {
       console.log(
         `User with UID '${req.decodedToken.uid}' has role '${customClaims.role}'`);
         res.status(200).send("okay");
     } else {
       console.log(`User with UID '${req.decodedToken.uid}' does not have any roles assigned`);
       res.status(200).send("okay");
       
     }
   } catch (error) {
     console.error("Error fetching user data:", error);
     res.status(400).send("not okay")
   }
})

module.exports = router;
