import { Constructor } from "../Utilities/Constructor.js"
import { PopUp } from "../Utilities/Popups.js"
import { UserProfile } from "./UserProfile.js"

const source = document.getElementById("source")
export const Logout = () => {
    localStorage.removeItem("JWT")
    localStorage.removeItem("userlogin");
    source.innerHTML = ""
    Login()
}

export const validateToken = async (token) => {
    try {
        const response = await fetch("https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `{ user { id login } }`
            })
        })
        return response.ok
    } catch (error) {
        console.error("Token validation error:", error)
        return false
    }
}

export const Login = () => {
    const loginForm = document.getElementById("login-form")
    if (loginForm) loginForm.remove()
    const form = Constructor("form", { id: "login-form" }, source)
    Constructor("input", { id: "username-input", placeholder: "Username", type: "text", name: "username" }, form)
    Constructor("input", { id: "password-input", placeholder: "Password", type: "password", name: "password" }, form)
    Constructor("button", { id: "loginbtn" }, form)

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        const username = document.getElementById("username-input").value,
            password = document.getElementById("password-input").value,
            credentials = btoa(`${username}:${password}`)
        const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        })

        if (response.status != 200) {
            PopUp(response.status, "Invalid Credentials")
            return
        }

        const token = await response.json()
        const isTokenValid = await validateToken(token)

        if (isTokenValid) {
            localStorage.setItem("userlogin", username)
            localStorage.setItem("JWT", token)
            UserProfile()
        } else {
            PopUp(response.status, "Invalid Token")
            return
        }
    })
}