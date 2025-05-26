export const Constructor = (tag, attribues = {}, appendTarget) => {
    let element
        if (tag === "svg" || tag === "line") {
            element =  document.createElementNS("http://www.w3.org/2000/svg", tag)
        } else {
            element = document.createElement(tag)
        }
        for (const [key, value] of Object.entries(attribues)) {
            if (key === "textContent") element.textContent = value
            element.setAttribute(key, value)
        }
        if (appendTarget && appendTarget.appendChild) {
            if (appendTarget === document) { document.body.appendChild(element) } else { appendTarget.appendChild(element) }
        } return element
    }