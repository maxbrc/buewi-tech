import { useState, useEffect, createContext, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { jwtDecode } from "jwt-decode";
import { v4 as uuid } from "uuid";
import "../styles/reset.css"
import Dashboard from "./Dashboard";
import Inventory from "./Inventory";
import Profile from "./Profile";
import BaseLayout from "./BaseLayout";
import Login from "./Login";
import BorrowingPortal from "./BorrowingPortal";
import AdminPanel from "./AdminPanel";
import Manuals from "./Manuals";
import { MessageType, Message } from "./MessageList";

import "../styles/app.css";
import { BackendResponse } from "../types/http";

interface PopupContextType {
  showPopup: (children: React.ReactNode) => void;
  closePopup: () => void;
};

export const PopupContext = createContext<PopupContextType>({
  showPopup: () => {
    throw new Error("showPopup called outside of PopupContext provider");
  },
  closePopup: () => {
    throw new Error("closePopup called outside of PopupContext provider");
  }
});

interface AuthContextType {
    sessionValid: boolean;
    validateSession: (overrideToken?: string) => Promise<string>;
    logout: () => Promise<void>;
    handleUnauthorizedSession: () => never;
}

export const AuthContext = createContext<AuthContextType>({
    sessionValid: false,
    validateSession: async () => "null",
    logout: async () => {},
    handleUnauthorizedSession: () => new Promise(() => {}) as never
})

interface MessageContextType {
    createMessage: (messageType: MessageType, content: string) => void;
}

export const MessageContext = createContext<MessageContextType>({
    createMessage: (type: MessageType, content: string) => {console.error("default message context used. bad coding!")}
})

interface RequestContextType {
    makeRequest: <T>(url: string, options?: RequestInit, requireAuth?: boolean) => Promise<T>;
}

export const RequestContext = createContext<RequestContextType>({
   makeRequest: async (url: string, options?: RequestInit, requireAuth: boolean = true) => {throw new Error("EWR")}
})

interface TokenValidation {
    valid: boolean;
    leewayUsed: boolean;
}

function App() {
    const [ displayPopup, setDisplayPopup ] = useState(false);
    const [ popupChildren, setPopupChildren ] = useState<React.ReactNode>(null);
    const [ accessToken, setAccessToken ] = useState<string | null>(null);
    const [ sessionValid, setSessionValid ] = useState(false);
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ thisUserID, setThisUserID ] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const showPopup = (children: React.ReactNode) => {
        setPopupChildren(children)
        setDisplayPopup(true)
    }

    const closePopup = () => {
        setPopupChildren(null)
        setDisplayPopup(false)
    }

    useEffect(() => {
        document.body.style.overflow = displayPopup ? "hidden" : "unset"
    }, [displayPopup])

    const createMessage = useCallback((messageType: MessageType, content: string) => {
        const newMessageUUID = uuid()
        setMessages(currMessages => [...currMessages, { uuid: newMessageUUID, type: messageType, content: content }])
        setTimeout(() => setMessages(currMessages => currMessages.filter(el => el.uuid != newMessageUUID)), 5000)
    }, [])

    const logout = useCallback(async () => {
        try {
            await makeRequest<null>("/api/logout", {
                method: "POST"
            })
        } catch (e) {
            createMessage(MessageType.ERROR, "Logout fehlgeschlagen: " + getErrorMessage(e))
        }

        handleUnauthorizedSession()
    }, [])

    const checkAccessTokenValid = (tokenToValidate: string | null): TokenValidation => {
        if (tokenToValidate === null) {
            return {
                valid: false,
                leewayUsed: false
            }
        }

        const token = jwtDecode(tokenToValidate)
        const tokenIssuedAt = token.iat
        if (tokenIssuedAt === undefined) {
            throw new Error("JWT token iat claim is undefined.")
        }
        const tokenExpiresAt = token.exp
        if (tokenExpiresAt === undefined) {
            throw new Error("JWT token exp claim is undefined.")
        }

        const currentTime = Date.now() / 1000

        if (currentTime < tokenIssuedAt || currentTime > tokenExpiresAt) {
            return {
                valid: false,
                leewayUsed: false
            }
        }

        if (currentTime > tokenExpiresAt-30) {
            return {
                valid: true,
                leewayUsed: true
            }
        }

        const tokenSubjectID = token.sub
        if (tokenSubjectID === undefined) {
            throw new Error("JWT token sub claim is undefined.")
        }

        setThisUserID(tokenSubjectID)

        return {
            valid: true,
            leewayUsed: false
        }
    }

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const handleUnauthorizedSession = useCallback((): never => {
        navigate("/login", {
            replace: true
        })

        setAccessToken(null)
        setSessionValid(false)

        return new Promise(() => {}) as never
    }, [])

    const validateSession = useCallback(async (overrideToken?: string): Promise<string> => {
        let tokenToUse: string | null = null;
        setAccessToken(token => {
            tokenToUse = token;
            return token
        })
        if (overrideToken !== undefined) tokenToUse = overrideToken

        let valRes;
        try {
            valRes = checkAccessTokenValid(tokenToUse)
        } catch (e) {
            throw e
        }

        let sessionValidTracker = false;

        if (!valRes.valid || valRes.leewayUsed) {
            try {
                tokenToUse = await tryRefresh();
            } catch (e) {
                throw new Error("Erneuerung der Sitzung fehlgeschlagen: " + getErrorMessage(e))
            }

            if (tokenToUse === null) return handleUnauthorizedSession()

            let valRes;
            try {
                valRes = checkAccessTokenValid(tokenToUse)
            } catch (e) {
                throw e
            }

            if (!valRes.valid) return handleUnauthorizedSession()
        }

        sessionValidTracker = true

        // This should NEVER hit
        if (tokenToUse === null) return handleUnauthorizedSession()

        setAccessToken(tokenToUse)
        setSessionValid(sessionValidTracker)

        return tokenToUse
    }, [])

    interface TokenRefreshResponse {
        access_token: string;
    }

    const tryRefresh = async (): Promise<string | null> => {
        let res: Response;
        try {
            res = await fetch("/api/refresh-token", {
                credentials: "include"
            })
        } catch (e) {
            throw new Error("Fehler beim Schicken der Anfrage: " + getErrorMessage(e))
        }

        switch (res.status) {
            case 200:
                let refreshResponse: BackendResponse<TokenRefreshResponse>;
                try {
                    refreshResponse = await res.json();
                } catch (e) {
                    throw new Error("Fehler beim Lesen des JSON-Request-Bodys: " + getErrorMessage(e))
                }
                return refreshResponse.content.access_token
            case 401:
                return null
            case 500:
                let textInternalServerError: string;
                try {
                    textInternalServerError = await res.text()
                } catch (e) {
                    throw new Error("Interner Server Fehler (wurde an den Entwickler gemeldet).")
                }

                throw new Error("Interner Server Fehler (wurde an den Entwickler gemeldet): " + textInternalServerError)
            default:
                let textOtherError: string;
                try {
                    textOtherError = await res.text()
                } catch (e) {
                    throw new Error("Anderer Fehler (wurde an den Entwickler gemeldet).")
                }

                throw new Error("Anderer Fehler (wurde an den Entwickler gemeldet): " + textOtherError)
        }
    }

    useEffect(() => {
        const run = async () => {
            console.log("Running session validation...")
            if (location.pathname === "/login") return
            try {
                await validateSession()
            } catch (e) {
                createMessage(MessageType.ERROR, getErrorMessage(e))
            }
        }
        run()
    }, [])

    const makeRequest = useCallback(async function<T>(url: string, options?: RequestInit, requiresAuth: boolean = true): Promise<T> {
        const requestInit = {
            ...options
        }
        
        if (requiresAuth) {
            let accessTokenToUse: string;

            try {
                accessTokenToUse = await validateSession()
            } catch (e) {
                throw new Error("Fehler beim Validieren der Sitzung: " + getErrorMessage(e))
            }

            requestInit.headers = {
                ...options?.headers,
                "Authorization": "Bearer " + accessTokenToUse
            }
        }

        let res: Response;
        try {
            res = await fetch(url, requestInit)
        } catch (e) {
            throw new Error("Fehler beim übermitteln der Anfrage: " + getErrorMessage(e))
        }
        
        switch (res.status) {
            case 200:
                let json: BackendResponse<T>;
                try {
                    json = await res.json()
                } catch (e) {
                    throw new Error("Fehler beim lesen des JSON-Request-Bodys: " + getErrorMessage(e))
                }

                return json.content
            case 401:
                if (requiresAuth) {
                    createMessage(MessageType.ERROR, "Sitzung ist inkonsistent. Bitte erneute Anmeldung versuchen. (Wurde an den Entwickler gemeldet)")
                    return handleUnauthorizedSession()
                } else {
                    throw new Error("Ungültige Zugangsdaten")
                }
            case 400:
                let textBadRequest: string;
                try {
                    textBadRequest = await res.text()
                } catch (e) {
                    throw new Error("Fehlerhafte Anfrage (Wurde an den Entwickler gemeldet)")
                }

                throw new Error("Fehlerhafte Anfrage (Wurde an den Entwickler gemeldet): " + textBadRequest)
            case 404:
                let textNotFound: string;
                try {
                    textNotFound = await res.text()
                } catch (e) {
                    throw new Error("Angefragte Resource nicht gefunden")
                }

                throw new Error("Angefrage Resource nicht gefunden: " + textNotFound)
            case 500:
                let textInternalServerError: string;
                try {
                    textInternalServerError = await res.text()
                } catch (e) {
                    throw new Error("Interner Server Fehler (Wurde an den Entwickler gemeldet)")
                }

                throw new Error("Interner Server Fehler (Wurde an den Entwickler gemeldet): " + textInternalServerError)
            default:
                let textOtherError: string;
                try {
                    textOtherError = await res.text()
                } catch (e) {
                    throw new Error("Anderer Fehler (Wurde an den Entwickler gemeldet)")
                }

                throw new Error("Anderer Fehler (Wurde an den Entwickler gemeldet): " + textOtherError)
        }
    }, [])

    return (
        <AuthContext value={{ sessionValid, validateSession, logout, handleUnauthorizedSession }}>
            <RequestContext value={{ makeRequest }} >
                <MessageContext value={{ createMessage }}>
                    <PopupContext value={{ showPopup, closePopup }}>
                        <Routes>
                            <Route path="/login" element={<Login messages={messages} />} />
                            <Route element={<BaseLayout messages={messages} displayPopup={displayPopup} popupChildren={popupChildren} showHeaderHomeIcon={false} />} >
                                <Route path="/" element={<Dashboard />} />
                            </Route>
                            <Route element={<BaseLayout messages={messages} displayPopup={displayPopup} popupChildren={popupChildren} />} >
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/profile" element={<Profile userID={thisUserID} />} />
                                <Route path="/borrowing" element={<BorrowingPortal />} />
                                <Route path="/resources" element={<Manuals />} />
                                <Route path="/admin" element={<AdminPanel />} />
                            </Route>
                        </Routes>
                    </PopupContext>
                </MessageContext>
            </RequestContext>
        </AuthContext>
    )
}

export default App