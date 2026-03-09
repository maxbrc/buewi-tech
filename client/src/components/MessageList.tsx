import "../styles/message_list.css";

import { Message, MessageType } from "../types/message";

function MessageList({ messages }: { messages: Message[]; }) {
    return (
        <div className="message-list">
            {
                messages.map(el => {
                    return (
                        <div
                            className={el.type}
                            key={el.uuid}
                        >
                            {el.content}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default MessageList