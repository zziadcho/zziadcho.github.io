import { Constructor } from "./Constructor.js"
import { DisplayAuditInfo, DisplayOvertimeXP, DisplayProjectXP, DisplayUserInfo } from "./DisplayData.js"

export const Terminal = () => {
    // === STATE MANAGEMENT ===
    const cmdHistory = []
    const grid = document.getElementById("grid")
    const termcommand = document.getElementById("terminput")
    const userLogin = localStorage.getItem("userlogin") || "user"

    let shouldClear = true
    let historyIndex = -1
    let svgDisplayed = false

    // === EVENT HANDLERS ===
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleEnterKey()
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            navigateHistory(-1)
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            navigateHistory(1)
        } else if (e.key === "Tab") {
            e.preventDefault()
            handleTabCompletion()
        }
    })

    // === COMMAND HANDLING ===
    const handleEnterKey = () => {
        if (svgDisplayed) {
            grid.innerHTML = ""
            cmdOutput("Terminal cleared - SVG chart was displayed")
            svgDisplayed = false
            shouldClear = false
        } else if (shouldClear) {
            grid.innerHTML = ""
            shouldClear = false
        }

        const termCommand = termcommand.value.trim()
        if (termCommand === "") return

        cmdLine(`${termCommand}`)

        cmdHistory.push(termCommand)
        historyIndex = -1
        termcommand.value = ""

        grid.style.display = "flex"
        grid.style.flexDirection = "column"
        grid.style.gap = "10px"

        const [cmd, ...args] = termCommand.split(" ")
        executeCommand(cmd, args)

        setTimeout(() => {
            scrollToBottom()
        }, 100)
    }

    const scrollToBottom = () => {
        grid.scrollTop = grid.scrollHeight
        const scrollableParent = grid.closest('[style*="overflow"]') || document.documentElement
        if (scrollableParent === document.documentElement) {
            window.scrollTo(0, document.body.scrollHeight)
        } else {
            scrollableParent.scrollTop = scrollableParent.scrollHeight
        }
        termcommand.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    // === COMMAND EXECUTION ===
    const executeCommand = (cmd, args) => {
        switch (cmd.toLowerCase()) {
            case "clear":
                clearcmd()
                break
            case "help":
                helpcmd()
                break
            case "graphctl":
                graphcmd(args)
                break
            case "history":
                historycmd()
                break
            case "ls":
                lscmd()
                break
            case "pwd":
                pwdcmd()
                break
            case "echo":
                echocmd(args)
                break
            default:
                unknowncmd(cmd)
        }
    }

    // === GRAPH COMMANDS ===
    const graphcmd = async (args) => {
        const [subcmd, ...subargs] = args

        // Clear terminal before displaying any SVG
        if (["audit", "whoami", "projects", "overtimexp"].includes(subcmd)) {
            grid.innerHTML = ""
            cmdLine(`graphctl ${subcmd}`)
        }

        switch (subcmd) {
            case "audit":
                try {
                    const element = await DisplayAuditInfo()
                    grid.appendChild(element)
                } catch (error) {
                    errorOutput(`Error loading audit data: ${error.message}`)
                }
                break

            case "whoami":
                try {
                    const element = await DisplayUserInfo()
                    grid.appendChild(element)
                } catch (error) {
                    errorOutput(`Error loading user info: ${error.message}`)
                }
                break

            case "projects":
                try {
                    const element = await DisplayProjectXP()
                    grid.appendChild(element)
                    svgDisplayed = true
                } catch (error) {
                    errorOutput(`Error loading projects: ${error.message}`)
                }
                break

            case "overtimexp":
                try {
                    const element = await DisplayOvertimeXP()
                    grid.appendChild(element)
                    svgDisplayed = true
                } catch (error) {
                    errorOutput(`Error loading overtime XP: ${error.message}`)
                }
                break
                
            case "help":
                graphHelpCmd()
                break
            default:
                errorOutput(`Invalid graphctl option '${subcmd}'! Try: graphctl help`)
        }
    }

    const graphHelpCmd = () => {
        const helpText = [
            "graphctl - Graph Control Commands:",
            "  whoami     - Display user information",
            "  projects   - Show project XP chart",
            "  overtimexp - Show XP progression over time",
            "  audit%     - Show audit percentage (coming soon)",
            "  help       - Show this help message"
        ]
        helpText.forEach(line => cmdOutput(line))
    }

    // === HISTORY NAVIGATION ===
    const navigateHistory = (direction) => {
        if (cmdHistory.length === 0) return

        if (direction === -1) {
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++
                termcommand.value = cmdHistory[cmdHistory.length - 1 - historyIndex]
            }
        } else {
            if (historyIndex > 0) {
                historyIndex--
                termcommand.value = cmdHistory[cmdHistory.length - 1 - historyIndex]
            } else if (historyIndex === 0) {
                historyIndex = -1
                termcommand.value = ""
            }
        }
    }

    // === TAB COMPLETION ===
    const handleTabCompletion = () => {
        const currentInput = termcommand.value
        const commands = ["clear", "help", "graphctl", "history", "ls", "pwd", "echo"]
        const graphctlOptions = ["whoami", "projects", "overtimexp", "audit", "help"]

        const parts = currentInput.split(" ")
        if (parts.length === 1) {
            const matches = commands.filter(cmd => cmd.startsWith(parts[0]))
            if (matches.length === 1) {
                termcommand.value = matches[0]
            }
        } else if (parts[0] === "graphctl" && parts.length === 2) {
            const matches = graphctlOptions.filter(opt => opt.startsWith(parts[1]))
            if (matches.length === 1) {
                termcommand.value = `graphctl ${matches[0]}`
            }
        }
    }

    // === STANDARD COMMANDS ===
    const unknowncmd = (cmd) => {
        errorOutput(`Unknown command '${cmd}'! Try: help`)
    }

    const clearcmd = () => {
        grid.innerHTML = ""
        shouldClear = true
        svgDisplayed = false
    }

    const helpcmd = () => {
        const helpCommands = [
            "Available commands:",
            "  clear      - Clear the terminal",
            "  help       - Show this help message",
            "  history    - Show command history",
            "  ls         - List directory contents",
            "  pwd        - Show current directory",
            "  echo <msg> - Display a message",
            "  graphctl   - Graph control commands (try 'graphctl help')",
            "",
            "Navigation:",
            "  ↑/↓ arrows - Navigate command history",
            "  Tab         - Auto-complete commands"
        ]
        helpCommands.forEach(line => cmdOutput(line))
    }

    const historycmd = () => {
        if (cmdHistory.length === 0) {
            cmdOutput("No command history")
            return
        }
        cmdHistory.forEach((cmd, index) => {
            cmdOutput(`${index + 1}  ${cmd}`)
        })
    }

    const lscmd = () => {
        cmdOutput("projects/  data/  graphs/  logs/")
    }

    const pwdcmd = () => {
        cmdOutput("/home/" + userLogin)
    }

    const echocmd = (args) => {
        const message = args.join(" ")
        cmdOutput(message || "")
    }

    // === OUTPUT HANDLERS ===
    const cmdLine = (command) => {
        const cmd = Constructor("div", { id: "cmd" }, grid)
        Constructor("span", {
            textContent: `${userLogin}@hostname:`,
            style: "color: #875FFF;"
        }, cmd)
        Constructor("span", {
            textContent: "~$ ",
            style: "color: white;"
        }, cmd)
        Constructor("span", {
            textContent: command,
            style: "color: #90EE90;"
        }, cmd)
    }

    const cmdOutput = (text) => {
        Constructor("div", {
            textContent: text,
            style: "color: white; margin-left: 20px;"
        }, grid)
        setTimeout(() => scrollToBottom(), 50)
    }

    const errorOutput = (text) => {
        Constructor("div", {
            textContent: text,
            style: "color: #FF6B6B; margin-left: 20px;"
        }, grid)
        setTimeout(() => scrollToBottom(), 50)
    }

    // === INITIALIZATION ===
    cmdOutput("Terminal initialized. Type 'help' for available commands.")
}