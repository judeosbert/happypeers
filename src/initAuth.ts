const { init } = require("next-firebase-auth");

export const initAuth = () => {
  init({
    authPageURL: "/",
    appPageURL: "/auth/redirect",
    loginAPIEndpoint: "/api/login", // required
    logoutAPIEndpoint: "/api/logout", // required
    onLoginRequestError: (err: any) => {
      console.error(err);
    },
    onLogoutRequestError: (err: any) => {
      console.error(err);
    },
    firebaseAdminInitConfig: {
      credential: {
        projectId: "findindie-add2b",
        clientEmail:
          "firebase-adminsdk-2jm7q@findindie-add2b.iam.gserviceaccount.com",
        // The private key must not be accessible on the client side.
        privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
      },
    },
    // Use application default credentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: {
      apiKey: "AIzaSyDXdPlnHEQHnF20awejZbtYkveKAL3SD7M", // required
      authDomain: "findindie-add2b.firebaseapp.com",
      projectId: "findindie-add2b",
      storageBucket: "findindie-add2b.appspot.com",
      messagingSenderId: "623158555720",
      appId: "1:623158555720:web:dffd674ed091fd22c4147d",
      measurementId: "G-XF3MP6YJVT",
    },
    cookies: {
      name: "AnonApp", // required
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: false, // set this to false in local (non-HTTPS) development
      signed: false,
    },
    onVerifyTokenError: (err: any) => {
      console.error(err);
    },
    onTokenRefreshError: (err: any) => {
      console.error(err);
    },
  });
};
