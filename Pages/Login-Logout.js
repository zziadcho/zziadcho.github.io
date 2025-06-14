import { Constructor } from "../Utilities/Constructor.js"
import { FetchQL } from "../Utilities/FetchQL.js"
import { PopUp } from "../Utilities/Popups.js"
import { UserProfile } from "./UserProfile.js"
import { clearSession, createSession } from "../Utilities/SessionManager.js"

const source = document.getElementById("source")

// === LOGOUT FUNCTIONALITY ===
export const Logout = async () => {
    await clearSession()
    source.innerHTML = ""
    Login()
}

// === LOGIN FUNCTIONALITY ===
export const Login = () => {
    const loginForm = document.getElementById("login-form")
    if (loginForm) loginForm.remove()

    const form = Constructor("form", { id: "login-form" }, source)
    Constructor("input", { id: "username-input", placeholder: "Username", type: "text", name: "username" }, form)
    Constructor("input", { id: "password-input", placeholder: "Password", type: "password", name: "password" }, form)
    const loginButton = Constructor("button", { id: "loginbtn", textContent: "Login" }, form)

    // === FORM SUBMISSION ===
    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        
        loginButton.disabled = true
        loginButton.textContent = "Please wait..."

        try {
            const username = document.getElementById("username-input").value,
                password = document.getElementById("password-input").value
            
            if (!username || !password) {
                PopUp(400, "Username and password are required")
                return
            }

            // === GET AUTH TOKEN ===
            const credentials = btoa(`${username}:${password}`)
            const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            })

            if (response.status !== 200) {
                PopUp(response.status, "Invalid Credentials")
                return
            }

            const token = await response.json()
            
            // === VALIDATE USER ===
            const usercheck = `
                {
                    user {
                        login
                    }
                }
            `
            
            const userData = await FetchQL(usercheck, token)
            
            if (userData.errors) {
                PopUp(401, "Authentication failed")
                return
            }
            
            if (!userData.data || !userData.data.user || !userData.data.user[0]) {
                PopUp(401, "User data not found")
                return
            }
            
            const userLogin = userData.data.user[0].login
            
            if (username !== userLogin) {
                PopUp(403, "Username mismatch")
                return
            }
            
            // === CREATE SESSION & NAVIGATE ===
            await createSession(token, userLogin)
            UserProfile()
        } catch (error) {
            console.error("Login error:", error)
            PopUp(500, "Login failed. Please try again.")
        } finally {
            loginButton.disabled = false
            loginButton.textContent = "Login"
        }
    })
}