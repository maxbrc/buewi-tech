interface Message {
    uuid: string;
    type: MessageType,
    content: string;
}

enum MessageType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}

interface MessageContextType {
    createMessage: (messageType: MessageType, content: string) => void;
}

export { Message, MessageType, MessageContextType }