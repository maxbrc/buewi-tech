import "../styles/message_list.css";

export enum MessageType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}

export interface Message {
    uuid: string;
    type: MessageType,
    content: string;
}

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