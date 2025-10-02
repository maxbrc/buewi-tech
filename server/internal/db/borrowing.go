package db

import (
	"database/sql"
	"fmt"
	"time"
)

type RawBorrowingEvent struct {
	ID                int
	SerialNumber      string
	BorrowerName      string
	BorrowFromUTC     time.Time
	BorrowUntilUTC    time.Time
	BorrowerAccountID int
	BorrowingStatusID int
}

type RawBorrowingStatus struct {
	ID          int
	Description string
}

func GetBorrowingEvents() ([]*RawBorrowingEvent, error) {
	rows, err := db.Query("SELECT * FROM borrowing_events")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	return processBorrowingEventRows(rows)
}

func GetActiveBorrowingEvents() ([]*RawBorrowingEvent, error) {
	rows, err := db.Query("SELECT * FROM borrowing_events WHERE borrowing_status_id=1")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	return processBorrowingEventRows(rows)
}

/* func GetBorrowingEventsBySerialNumber(serialNumber string) ([]*RawBorrowingEvent, error) {
	rows, err := db.Query("SELECT * FROM borrowing_events WHERE serial_number = ?", serialNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	return processBorrowingEventRows(rows)
} */

func processBorrowingEventRows(rows *sql.Rows) ([]*RawBorrowingEvent, error) {
	loc, _ := time.LoadLocation("UTC")

	var borrowingEvents []*RawBorrowingEvent
	for rows.Next() {
		var borrowingEvent RawBorrowingEvent
		var rawBorrowFromTime, rawBorrowUntilTime string
		err := rows.Scan(&borrowingEvent.ID, &borrowingEvent.SerialNumber, &borrowingEvent.BorrowerName, &rawBorrowFromTime, &rawBorrowUntilTime, &borrowingEvent.BorrowerAccountID, &borrowingEvent.BorrowingStatusID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		borrowFromParsed, err := time.ParseInLocation(time.DateTime, rawBorrowFromTime, loc)
		if err != nil {
			return nil, fmt.Errorf("failed to parse borrowFrom time: %v", err)
		}

		borrowUntilParsed, err := time.ParseInLocation(time.DateTime, rawBorrowUntilTime, loc)
		if err != nil {
			return nil, fmt.Errorf("failed to parse borrowUntil time: %v", err)
		}

		borrowingEvent.BorrowFromUTC = borrowFromParsed
		borrowingEvent.BorrowUntilUTC = borrowUntilParsed

		borrowingEvents = append(borrowingEvents, &borrowingEvent)
	}

	return borrowingEvents, nil
}

func GetBorrowingStatusByID(id int) (*RawBorrowingStatus, error) {
	rows, err := db.Query("SELECT * FROM borrowing_statuses WHERE id = ?", id)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rowAvailable := rows.Next()
	if !rowAvailable {
		return nil, fmt.Errorf("no borrowing status with this id")
	}

	var status RawBorrowingStatus
	err = rows.Scan(&status.ID, &status.Description)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	return &status, nil
}
