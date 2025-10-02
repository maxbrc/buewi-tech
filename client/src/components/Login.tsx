import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

import "../styles/login.css"

import GymBwLogo from "../assets/gymbw_main.png";
import AccountCircleIcon from "../assets/account_circle.svg";
import LockIcon from "../assets/lock.svg";
import EyeIcon from "../assets/eye.svg";
import EyeOffIcon from "../assets/eye_off.svg";
import { AuthContext, MessageContext, RequestContext } from "./App";
import MessageList, { MessageType } from "./MessageList";
import { Message } from "./MessageList";

function Login({ messages }: { messages: Message[]; }) {
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ showPassword, setShowPassword ] = useState(false);
    
    const navigate = useNavigate()

    const { sessionValid, validateSession, handleUnauthorizedSession } = useContext(AuthContext)

    useEffect(() => {
        if (sessionValid) {
            navigate("/", {
                replace: true
            })
        }
    }, [sessionValid])

    interface SuccessfulLoginResponse {
        access_token: string;
    }

    const resetInputs = useCallback(() => {
        setUsername("")
        setPassword("")
    }, [])

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const postLogin = async () => {
        if (username == "" || password == "") {
            createMessage(MessageType.ERROR, "Benutzername und Passwort dürfen nicht leer sein.")
            return
        }

        try {
            const loginResponse = await makeRequest<SuccessfulLoginResponse>("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password
                })
            }, false)

            try {
                await validateSession(loginResponse.access_token)
            } catch (e) {
                createMessage(MessageType.ERROR, "Fehler beim Validieren der neuen Sitzung, bitte erneute Anmeldung versuchen: " + getErrorMessage(e))
                return handleUnauthorizedSession()
            }
        } catch (e) {
            createMessage(MessageType.ERROR, "Login fehlgeschlagen: " + getErrorMessage(e))
        }

        resetInputs()
    }

    const { createMessage } = useContext(MessageContext);
    const { makeRequest } = useContext(RequestContext);

    return (
        <main>
            <MessageList messages={messages} />
            <div className="login">
                <section className="login-welcome">
                    <img src={GymBwLogo} alt="Logo des Gymnasium Bürgerwiese" />
                    <section className="login-heading">
                        <span>Offizielle Seite der</span>
                        <h1>
                            Veranstaltungstechnik<br/>
                            Gymnasium Bürgerwiese
                        </h1>
                    </section>
                </section>
                <section className="login-credentials">
                    <div>
                        <div className="credential">
                            <label htmlFor="username">Benutzername</label>
                            <div className="credential-input">
                                <img src={AccountCircleIcon} alt="Account Symbol" />
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="credential">
                            <label htmlFor="password">Passwort</label>
                            <div className="credential-input">
                                <img src={LockIcon} alt="Schloss Symbol" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                                <img
                                    src={showPassword ? EyeOffIcon : EyeIcon}
                                    alt="Passwort zeigen"
                                    onClick={() => setShowPassword(currShow => !currShow)}
                                />
                            </div>
                        </div>
                        <button onClick={postLogin}>
                            Login
                        </button>
                    </div>
                </section>
                <div className="spacer"></div>
            </div>
        </main>
    )
}

export default Login