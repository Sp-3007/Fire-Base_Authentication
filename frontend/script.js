import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  reload,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHSG-BlMBXhL1cDpmIdviYIGH_oCjnJDE",
  authDomain: "my-project-sp2007.firebaseapp.com",
  projectId: "my-project-sp2007",
  storageBucket: "my-project-sp2007.appspot.com",
  messagingSenderId: "403707906095",
  appId: "1:403707906095:web:eb436b31b24ea414021eda",
  measurementId: "G-ND475L90ML",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct");
const forgotlink = document.getElementById("forgot-link");
const radioButtons = document.querySelectorAll(
  'input[type="radio"][name="userType"]'
);
const signupEmailIn = document.getElementById("email-signup");
const confirmSignupEmailIn = document.getElementById("confirm-email-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById(
  "confirm-password-signup"
);
const googleSignInBtn = document.getElementById("googleSignInBtn");
const createacctbtn = document.getElementById("create-acct-btn");

const returnBtn = document.getElementById("return-btn");
let role = "user";

// Adding change event listener to each radio button
radioButtons.forEach(function (radioButton) {
  radioButton.addEventListener("change", function () {
    if (this.checked) {
      role = this.value;
    }
  });
});

createacctbtn.addEventListener("click", async () => {
  const signupEmail = signupEmailIn.value;
  const confirmSignupEmail = confirmSignupEmailIn.value;
  const signupPassword = signupPasswordIn.value;
  const confirmSignUpPassword = confirmSignUpPasswordIn.value;
  let isVerified = true;

  if (signupEmail !== confirmSignupEmail) {
    window.alert("Email fields do not match. Try again.");
    isVerified = false;
  }

  if (signupPassword !== confirmSignUpPassword) {
    window.alert("Password fields do not match. Try again.");
    isVerified = false;
  }

  if (
    !signupEmail ||
    !confirmSignupEmail ||
    !signupPassword ||
    !confirmSignUpPassword
  ) {
    window.alert("Please fill out all required fields.");
    isVerified = false;
  }

  if (isVerified) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert(
        "Successfully Registered.\n\n We sent you a verification link to your email. Please click on the link to verify your email."
      );
      sendTokenToBackend_register(user.accessToken, role);
    } catch (error) {
      console.error("Registration error:", error);
      window.alert(error.message);
    }
  }
});

async function sendTokenToBackend_register(idToken, type = null) {
  const backendUrl = "http://localhost:3000/user/register";
  if (type == "user") {
    role = "user";
  }
  await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      userType: role,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send token to backend for Registration");
      }
      console.log("Token sent successfully to backend for Registration");
    })
    .catch((error) => {
      console.error("Error sending token to backend:", error);
    });
}

async function sendTokenToBackend_login(idToken) {
  const backendUrl = "http://localhost:3000/user/login";
  await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send token to backend for Login");
      }
      console.log("Token sent successfully to backend for Login");
    })
    .catch((error) => {
      console.error("Error sending token to backend:", error);
    });
}

submitButton.addEventListener("click", async function () {
  var email = emailInput.value;
  var password = passwordInput.value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log(user);

    const isEmailVerified = await checkEmailVerification(user);

    if (isEmailVerified) {
      alert("Welcome back , Login Successful!");
      sendTokenToBackend_login(user.accessToken); // Assuming you have a function to handle this
    } else {
      await signOut(auth);
      alert("Please Verify Your Email First!");
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorMessage);
    window.alert(errorMessage);
  }
});

const checkEmailVerification = async (user) => {
  try {
    await user.reload();
    return user.emailVerified;
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
};

signupButton.addEventListener("click", function () {
  main.style.display = "none";
  createacct.style.display = "block";
});

returnBtn.addEventListener("click", function () {
  main.style.display = "block";
  createacct.style.display = "none";
});

forgotlink.addEventListener("click", Password_reset);

function Password_reset() {
  const email = emailInput.value;
  sendPasswordResetEmail(auth, email)
    .then(function () {
      alert("Password reset email sent. Please check your email.");
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error(errorCode, errorMessage);
      // Display error to user (e.g., invalid email, user not found)
      alert(errorMessage);
    });
}

googleSignInBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    if (result._tokenResponse.isNewUser === true) {
      await sendTokenToBackend_register(result.user.accessToken, "user");
    }
    await sendTokenToBackend_login(result.user.accessToken);
  } catch (error) {
    console.log(error);
  }
});
