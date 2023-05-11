import admin from "firebase-admin"

const serviceAccount = require("../api/serviceAccount.json")
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
} catch (error) {
    console.error("Failed to iniitalize admin app")
}


// export function verifyUser(uid: string, token: string) {

// }

// export function getCompany(uid: string) {

// }

// export function getCompanyFromEmail(email: string) {
//     return email.split("@")[1]
// }

// const adminApp = admin.initializeApp({
//     credential: admin.credential.cert(firebaseConfig)
// })
