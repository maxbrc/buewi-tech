import { Outlet } from "react-router";
import { useContext } from "react";

import Header from "./Header";
import PopUp from "./PopUp";
import MessageList from "./MessageList";
import { Message } from "./MessageList";

import "../styles/base_layout.css";
import { AuthContext } from "./App";


function Base({ messages, displayPopup, popupChildren, showHeaderHomeIcon = true }: { messages: Message[], displayPopup: boolean; popupChildren: React.ReactNode; showHeaderHomeIcon?: boolean; }) {

    const { sessionValid } = useContext(AuthContext);

    return (
        <>
            {
                sessionValid ? (
                    <>
                        <Header showHomeIcon={showHeaderHomeIcon}/>
                        <main>
                            <MessageList messages={messages} />
                            <PopUp show={displayPopup}>{popupChildren}</PopUp>
                            <Outlet />
                        </main>
                    </>
                ) : (
                    <main>
                        <MessageList messages={messages} />
                        <div className="loading">
                            <h1>Lädt...</h1>
                            <span>Validierung der Session im Gange...</span>
                        </div>
                    </main>
                )
            }
            
        </>
    )
}

export default Base