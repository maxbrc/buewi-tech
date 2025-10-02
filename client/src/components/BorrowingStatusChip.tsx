import { BorrowingEvent } from "../types/borrowing";

import "../styles/borrowing_status_chip.css"

function BorrowingStatusChip({ borrowingEvent }: { borrowingEvent: BorrowingEvent | null; }) {
        function getBorrowingStatusClassName(borrowingStatus: string): string {
        borrowingStatus = borrowingStatus.toLowerCase()

        switch (borrowingStatus) {
            case "verfügbar":
                return "available"
            case "ausgeliehen":
                return "borrowed"
            case "überfällig":
                return "overdue"
            case "nicht zurückgegeben":
                return "lost"
            default:
                return ""
        }
    }

    return (
        <span className={`borrowing-status ${borrowingEvent === null ? getBorrowingStatusClassName("verfügbar"): getBorrowingStatusClassName(borrowingEvent.borrowing_status)}`}>
            {borrowingEvent === null ? "Verfügbar" : borrowingEvent.borrowing_status}
        </span>
    )
}

export default BorrowingStatusChip