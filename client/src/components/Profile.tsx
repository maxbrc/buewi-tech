import { useEffect, useState, useContext } from "react";

import { AuthContext, MessageContext } from "./App";
import { MessageType } from "./MessageList";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    created_at: string;
    username: string;
    tel: string;
}

function Profile({ userID }: { userID: string; }) {
    const [ user, setUser ] = useState<User | null>(null);

    const { createMessage } = useContext(MessageContext);

    const getUser = async () => {
        let user: User;
        return null
    }

    return (
        <>
            <h2>Mein Account</h2>
            <span>In Arbeit...</span>
        </>
    )
}

export default Profile