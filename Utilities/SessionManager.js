import { FetchQL } from "./FetchQL.js"

// Session storage keys
const TOKEN_KEY = "JWT"
const USER_KEY = "userlogin"
const EXPIRE_KEY = "session_expires"

/**
 * Creates a secure session with token validation
 * @param {string} token - The JWT token
 * @param {string} username - The username
 */
export const createSession = async (token, username) => {
    if (!token || !username) {
        throw new Error("Invalid session data")
    }
    
    // Store the token and user info
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, username)
    
    // Set expiration (2 hours from now)
    const expiresAt = Date.now() + (2 * 60 * 60 * 1000)
    localStorage.setItem(EXPIRE_KEY, expiresAt)
    
    return true
}

/**
 * Validates the current session with the server
 * @returns {Promise<boolean>} Whether the session is valid
 */
export const validateSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const username = localStorage.getItem(USER_KEY)
    const expiresAt = localStorage.getItem(EXPIRE_KEY)
    
    // Check if token exists and has not expired
    if (!token || !username || !expiresAt) {
        return false
    }
    
    // Check if session has expired
    if (Date.now() > parseInt(expiresAt)) {
        await clearSession()
        return false
    }
    
    // Validate token with server using a simple query
    try {
        const validationQuery = `
            {
                user {
                    login
                }
            }
        `
        
        const response = await FetchQL(validationQuery, token)
        
        // Check for errors or invalid responses
        if (response.errors || !response.data || !response.data.user) {
            await clearSession()
            return false
        }
        
        // Verify username matches
        const serverUsername = response.data.user[0]?.login
        if (!serverUsername || serverUsername !== username) {
            await clearSession()
            return false
        }
        
        // Refresh the expiration time
        const newExpiresAt = Date.now() + (2 * 60 * 60 * 1000)
        localStorage.setItem(EXPIRE_KEY, newExpiresAt)
        
        return true
    } catch (error) {
        console.error("Session validation error:", error)
        await clearSession()
        return false
    }
}

/**
 * Properly clears the current session
 */
export const clearSession = async () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRE_KEY)
}

/**
 * Gets the current token if session is valid
 * @returns {string|null} The JWT token or null
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * Gets the current username if session is valid
 * @returns {string|null} The username or null
 */
export const getUsername = () => {
    return localStorage.getItem(USER_KEY)
}
