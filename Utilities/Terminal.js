import { Constructor } from "./Constructor.js"
import { DisplayAuditInfo, DisplayOvertimeXP, DisplayProjectXP, DisplayUserInfo } from "./DisplayData.js"

export const Terminal = () => {
    const cmdHistory = []
    const grid = document.getElementById("grid")
    const termcommand = document.getElementById("terminput")
    const userLogin = localStorage.getItem("userlogin") || "user"

    let shouldClear = true
    let historyIndex = -1
    let svgDisplayed = false

    // Enhanced keyboard event handling
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

    const handleEnterKey = () => {
        // Clear terminal if SVG was displayed and user enters new command
        if (svgDisplayed) {
            grid.innerHTML = ""
            cmdOutput("Terminal cleared - SVG chart was displayed")
            svgDisplayed = false
            shouldClear = false
        } else if (shouldClear) {
            grid.innerHTML = ""
            shouldClear = false
        }

        // if (shouldWarn) warning()

        const termCommand = termcommand.value.trim()
        if (termCommand === "") return

        // Display the command that was entered
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
        // Scroll the grid container to bottom
        grid.scrollTop = grid.scrollHeight

        // If grid is inside another scrollable container, scroll that too
        const scrollableParent = grid.closest('[style*="overflow"]') || document.documentElement
        if (scrollableParent === document.documentElement) {
            window.scrollTo(0, document.body.scrollHeight)
        } else {
            scrollableParent.scrollTop = scrollableParent.scrollHeight
        }

        // Also ensure the terminal input stays in view
        termcommand.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

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

    const graphcmd = async (args) => {
        const [subcmd, ...subargs] = args

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
                    shouldWarn = true
                    svgDisplayed = true // Mark that SVG was displayed
                } catch (error) {
                    errorOutput(`Error loading projects: ${error.message}`)
                }
                break

            case "overtimexp":
                try {
                    const element = await DisplayOvertimeXP()
                    grid.appendChild(element)
                    shouldWarn = true
                    svgDisplayed = true // Mark that SVG was displayed
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

    const navigateHistory = (direction) => {
        if (cmdHistory.length === 0) return

        if (direction === -1) { // Up arrow
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++
                termcommand.value = cmdHistory[cmdHistory.length - 1 - historyIndex]
            }
        } else { // Down arrow
            if (historyIndex > 0) {
                historyIndex--
                termcommand.value = cmdHistory[cmdHistory.length - 1 - historyIndex]
            } else if (historyIndex === 0) {
                historyIndex = -1
                termcommand.value = ""
            }
        }
    }

    const handleTabCompletion = () => {
        const currentInput = termcommand.value
        const commands = ["clear", "help", "graphctl", "history", "ls", "pwd", "echo"]
        const graphctlOptions = ["whoami", "projects", "overtimexp", "audit", "help"]

        const parts = currentInput.split(" ")
        if (parts.length === 1) {
            // Complete main commands
            const matches = commands.filter(cmd => cmd.startsWith(parts[0]))
            if (matches.length === 1) {
                termcommand.value = matches[0]
            }
        } else if (parts[0] === "graphctl" && parts.length === 2) {
            // Complete graphctl subcommands
            const matches = graphctlOptions.filter(opt => opt.startsWith(parts[1]))
            if (matches.length === 1) {
                termcommand.value = `graphctl ${matches[0]}`
            }
        }
    }

    const unknowncmd = (cmd) => {
        errorOutput(`Unknown command '${cmd}'! Try: help`)
    }

    const clearcmd = () => {
        grid.innerHTML = ""
        shouldClear = true
        svgDisplayed = false // Reset SVG flag when manually clearing
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
        // Auto-scroll after adding content
        setTimeout(() => scrollToBottom(), 50)
    }

    const errorOutput = (text) => {
        Constructor("div", {
            textContent: text,
            style: "color: #FF6B6B; margin-left: 20px;"
        }, grid)
        // Auto-scroll after adding content
        setTimeout(() => scrollToBottom(), 50)
    }

    // Initialize terminal
    cmdOutput("Terminal initialized. Type 'help' for available commands.")
}