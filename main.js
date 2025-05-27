import { Login } from "./Pages/Login-Logout.js"
import { UserProfile } from "./Pages/UserProfile.js"
import { validateSession } from "./Utilities/SessionManager.js"

// === INITIALIZATION ===

document.addEventListener("DOMContentLoaded", async () => {
    const source = document.getElementById("source")
    source.innerHTML = "<div class='loading'>Loading...</div>"
    
    try {
        const isValid = await validateSession()
        if (isValid) {
            UserProfile()
        } else {
            Login()
        }
    } catch (error) {
        console.error("Session validation error:", error)
        Login()
    }
})