import { Constructor } from "./Constructor.js"
const popupParent = Constructor("div", { "id": "popups" }, document.getElementById("source"))

export const PopUp = (code, errText) => {
    const popup = Constructor("div", { "id": `err-${code}`, "textContent": errText }, popupParent)
    setTimeout(() => {
        popup.remove()
    }, 2000)
}