import { Login } from "./Pages/Login-Logout.js"
import { UserProfile } from "./Pages/UserProfile.js"
import { validateSession } from "./Utilities/SessionManager.js"
import { PopUp } from "./Utilities/Popups.js"

// === INITIALIZATION ===

document.addEventListener("DOMContentLoaded", async () => {    
    try {
        // Test popup system
        PopUp(200, "App initialized successfully")
        
        const isValid = await validateSession()
        if (isValid) {
            UserProfile()
        } else {
            Login()
        }
    } catch (error) {
        console.error("Session validation error:", error)
        PopUp(500, "Session validation error")
        Login()
    }
})