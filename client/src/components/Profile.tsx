import { useEffect, useState, useContext } from "react";

import { AuthContext, MessageContext } from "./App";

import { User } from "../types/user";

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