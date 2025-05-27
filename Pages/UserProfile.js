import { Constructor } from "../Utilities/Constructor.js"
import { Terminal } from "../Utilities/Terminal.js"
import { Logout } from "./Login-Logout.js"

export const UserProfile = async () => {
    // === SETUP ===
    const source = document.getElementById("source")
    const userLogin = localStorage.getItem("userlogin")
    function updateTime() {
        const date = new Date();
        const formattedDate = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
        setInterval
        return formattedDate;
    }
    source.innerHTML = ""

    // === NAVBAR ===
    Constructor("div", { id: "navbar" }, source)

    Constructor("h3", { id: "activities", textContent: "GraphQL" }, navbar)
    const displaydate = Constructor("h3", { id: "date", textContent: updateTime() }, navbar)
    setInterval(() => {
        displaydate.textContent = updateTime();
    }, 10000);

    const logoutbtn = Constructor("span", { id: "powerbutton", class: "material-symbols-outlined", textContent: "power_settings_circle" }, navbar)
    logoutbtn.addEventListener("click", Logout)

    // === TERMINAL CONTAINER ===
    Constructor("div", { id: "container" }, source)
    Constructor("div", { id: "topbar" }, container)
    Constructor("div", { id: "grid" }, container)

    Constructor("div", { id: "child1" }, topbar)
    Constructor("span", { class: "material-symbols-outlined", textContent: "search" }, child1)

    Constructor("div", { id: "child2" }, topbar)
    Constructor("h3", { textContent: `${userLogin}@hostname` }, child2)

    Constructor("div", { id: "child3" }, topbar)
    Constructor("span", { class: "material-symbols-outlined", textContent: "minimize" }, child3)
    Constructor("span", { class: "material-symbols-outlined", textContent: "fullscreen" }, child3)
    Constructor("span", { class: "material-symbols-outlined", textContent: "cancel" }, child3)

    Constructor("input", { id: "terminput", placeholder: "Type your command..." }, container)

    // === INITIALIZE TERMINAL ===
    Terminal()
}
