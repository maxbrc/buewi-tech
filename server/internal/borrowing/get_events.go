package borrowing

import (
	"fmt"
	"time"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type BorrowingEvent struct {
	ID                int    `json:"id"`
	SerialNumber      string `json:"serial_number"`
	BorrowerName      string `json:"borrower_name"`
	BorrowFromUTC     string `json:"borrow_from_utc"`
	BorrowUntilUTC    string `json:"borrow_until_utc"`
	BorrowerAccountID int    `json:"borrower_account_id"`
	BorrowingStatus   string `json:"borrowing_status"`
	BorrowingStatusID int    `json:"borrowing_status_id"`
}

func GetEvents() ([]*BorrowingEvent, error) {
	rawBorrowingEvents, err := db.GetBorrowingEvents()
	if err != nil {
		return nil, fmt.Errorf("failed to get borrowing events: %v", err)
	}

	borrowingEvents := []*BorrowingEvent{}
	for _, rawEvent := range rawBorrowingEvents {
		borrowingEvent, err := processRawBorrowingEvent(rawEvent)
		if err != nil {
			return nil, fmt.Errorf("failed to process raw borrowing event: %v", err)
		}

		borrowingEvents = append(borrowingEvents, borrowingEvent)
	}

	return borrowingEvents, nil
}

func processRawBorrowingEvent(rawEvent *db.RawBorrowingEvent) (*BorrowingEvent, error) {
	borrowingStatus, err := db.GetBorrowingStatusByID(rawEvent.BorrowingStatusID)
	if err != nil {
		return nil, fmt.Errorf("failed to get borrowing status description for event: %v", err)
	}

	return &BorrowingEvent{
		ID:                rawEvent.ID,
		SerialNumber:      rawEvent.SerialNumber,
		BorrowerName:      rawEvent.BorrowerName,
		BorrowFromUTC:     rawEvent.BorrowFromUTC.Format(time.RFC3339),
		BorrowUntilUTC:    rawEvent.BorrowFromUTC.Format(time.RFC3339),
		BorrowerAccountID: rawEvent.BorrowerAccountID,
		BorrowingStatus:   borrowingStatus.Description,
	}, nil
}

func GetActiveEvents() (map[string]*BorrowingEvent, error) {
	rawBorrowingEvents, err := db.GetActiveBorrowingEvents()
	if err != nil {
		return nil, fmt.Errorf("failed to get active borrowing events: %v", err)
	}

	borrowingEvents := make(map[string]*BorrowingEvent)
	for _, rawEvent := range rawBorrowingEvents {
		borrowingEvent, err := processRawBorrowingEvent(rawEvent)
		if err != nil {
			return nil, fmt.Errorf("failed to process raw borrowing event: %v", err)
		}

		borrowingEvents[rawEvent.SerialNumber] = borrowingEvent
	}

	return borrowingEvents, nil
}

/* func GetActiveEventForSerialNumber(serialNumber string) (*BorrowingEvent, error) {
	rawBorrowingEvents, err := db.GetBorrowingEventsBySerialNumber(serialNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get borrowing events for serial number %v: %v", serialNumber, err)
	}

	var activeBorrowingEvent *BorrowingEvent = nil
	for _, rawEvent := range rawBorrowingEvents {
		if rawEvent.BorrowingStatusID == 1 {
			activeBorrowingEvent = processRawBorrowingEvent(rawEvent)
		}
	}

	return activeBorrowingEvent, nil
} */
