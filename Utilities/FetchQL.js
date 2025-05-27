import { clearSession } from "./SessionManager.js"

export const FetchQL = async (query, token) => {
    try {
        if (!token) {
            throw new Error("No authentication token provided")
        }
        
        const response = await fetch("https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: query
            })
        })
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            await clearSession()
            window.location.reload() // Force reload on auth failure
            throw new Error("Authentication failed")
        }
        
        if (!response.ok) {
            throw new Error(`GraphQL request failed with status: ${response.status}`)
        }
        
        return response.json()
    } catch (error) {
        console.error("FetchQL error:", error)
        throw error
    }
}