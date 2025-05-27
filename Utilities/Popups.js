import { Constructor } from "./Constructor.js"

// === POPUP SYSTEM ===
let popupParent = null;

export const PopUp = (code, errText) => {
    // Get or create the popup container only once
    if (!popupParent) {
        // Use source element for the popups container
        const source = document.getElementById("source");
        // Create the popup container with ID that matches CSS selector
        popupParent = Constructor("div", { "id": "popups" }, source);
    }

    // Create simple popup with ID matching CSS selectors (no inline styles)
    const popup = Constructor("div", { 
        "id": `err-${code}`, 
        "textContent": errText
    }, popupParent);
    
    // Remove after delay
    setTimeout(() => {
        popup.remove();
    }, 2000);
}