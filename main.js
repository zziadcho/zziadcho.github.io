import { Login, validateToken } from "./Pages/Login-Logout.js"
import { UserProfile } from "./Pages/UserProfile.js"

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("JWT")
    const username = localStorage.getItem("userlogin")

    if (token && username) {
        const isValid = await validateToken(token)
        if (isValid) {
            UserProfile()
            return
        }
    }
    
    Login()
})