interface BorrowingEvent {
    id: number;
    serial_number: string;
    borrower_name: string;
    borrow_from_utc: string;
    borrow_until_utc: string;
    borrower_account_id: number;
    borrowing_status: string;
}

export { BorrowingEvent }