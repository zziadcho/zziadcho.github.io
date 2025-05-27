import { FetchQL } from "./FetchQL.js"

// === SESSION MANAGEMENT ===
const TOKEN_KEY = "JWT"
const USER_KEY = "userlogin"
const LAST_VALIDATION_KEY = "last_validation"
const VALIDATION_CACHE = 10000

let validationInProgress = false
let validationPromise = null

export const createSession = async (token, username) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, username)
    localStorage.setItem(LAST_VALIDATION_KEY, Date.now().toString())
    return true
}

export const validateSession = async () => {
    if (validationInProgress) return validationPromise
    
    validationInProgress = true
    validationPromise = _doValidate()
    validationPromise.finally(() => validationInProgress = false)
    
    return validationPromise
}

const _doValidate = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const username = localStorage.getItem(USER_KEY)
    const lastValidation = localStorage.getItem(LAST_VALIDATION_KEY)
    
    if (!token || !username) return false
    
    if (lastValidation && (Date.now() - parseInt(lastValidation) < VALIDATION_CACHE)) 
        return true
    
    try {
        const query = `{ user { login } }`
        const response = await FetchQL(query, token)
        
        if (!response.data?.user?.[0]?.login) {
            clearSession()
            return false
        }
        
        if (response.data.user[0].login !== username) {
            clearSession()
            return false
        }
        
        localStorage.setItem(LAST_VALIDATION_KEY, Date.now().toString())
        return true
    } catch (error) {
        if (error.name === "TypeError" && error.message.includes("NetworkError") && lastValidation)
            return true
            
        clearSession()
        return false
    }
}

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(LAST_VALIDATION_KEY)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getUsername = () => localStorage.getItem(USER_KEY)
