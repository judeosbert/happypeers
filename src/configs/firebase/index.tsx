import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
export const  OAUTH_ACCESS_TOKEN = "oat"
export const TOKEN_KEY = "tk"

const firebaseConfig = {
    apiKey: "AIzaSyDXdPlnHEQHnF20awejZbtYkveKAL3SD7M",
    authDomain: "findindie-add2b.firebaseapp.com",
    projectId: "findindie-add2b",
    storageBucket: "findindie-add2b.appspot.com",
    messagingSenderId: "623158555720",
    appId: "1:623158555720:web:dffd674ed091fd22c4147d",
    measurementId: "G-XF3MP6YJVT"
  };

export const FirebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(FirebaseApp);

export async function   signinWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    const oauthCredentials = GoogleAuthProvider.credentialFromResult(result);
    if(!oauthCredentials){
        throw new Error('Failed to login with google, please try again');
    }
    localStorage.setItem(TOKEN_KEY,oauthCredentials.idToken??"")
    localStorage.setItem(OAUTH_ACCESS_TOKEN,oauthCredentials.accessToken??"")
    return { user: result?.user, oAuthCredentials: oauthCredentials };
  } catch (error) {
    throw new Error('Failed to login with google, please try again');
  }
}
export async function logout() {
  await firebaseAuth.signOut();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OAUTH_ACCESS_TOKEN);
}

export function isTokenAvailable() {
  const oauthAccessToken = localStorage.getItem(OAUTH_ACCESS_TOKEN);
  const token = localStorage.getItem(TOKEN_KEY);
  return (oauthAccessToken && token);
}