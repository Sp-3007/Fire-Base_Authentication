const admin = require("firebase-admin");
 
const authentication = async (req,res,next)=>{
     
const idToken = req.headers.authorization;

  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(idToken.replace("Bearer ", ""));
    req.decodedToken =decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    console.log({ error: "Unauthorized" });
    res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = authentication