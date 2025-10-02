package inventory

import (
	"encoding/json"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type ItemRequest struct {
	Name             string  `json:"name"`
	SerialNumber     string  `json:"serial_number"`
	SubcategoryID    int     `json:"subcategory_id"`
	ConditionID      int     `json:"condition_id"`
	ConditionComment *string `json:"condition_comment"`
	LocationID       int     `json:"location_id"`
}

func validateNewSerialNumber(serialNumber string, subcategoryID int) error {
	if len(serialNumber) != 6 {
		return fmt.Errorf("serial number must be 6 characters long")
	}

	subcategoryPrefix := strconv.Itoa(subcategoryID) + "-"
	if !strings.HasPrefix(serialNumber, subcategoryPrefix) {
		return fmt.Errorf("serial number must contain prefix consisting of subcategory and hyphen (specifically '%v')", subcategoryPrefix)
	}

	_, err := strconv.ParseInt(serialNumber[3:], 10, 64)
	if err != nil {
		return fmt.Errorf("running number must be an integer")
	}

	serialNumbersForSubcategory, err := db.GetSerialNumbersForSubcategoryID(subcategoryID)
	if err != nil {
		return fmt.Errorf("failed to get serial numbers for subcategory: %v", err)
	}

	if slices.Contains(serialNumbersForSubcategory, serialNumber) {
		return fmt.Errorf("item with that serial number already exists")
	}

	return nil
}

func AddItem(reqBody []byte) error {
	var itemRequest ItemRequest
	err := json.Unmarshal(reqBody, &itemRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	if itemRequest.Name == "" || itemRequest.SerialNumber == "" || *itemRequest.ConditionComment == "" {
		return fmt.Errorf("empty values not allowed")
	}

	err = validateNewSerialNumber(itemRequest.SerialNumber, itemRequest.SubcategoryID)
	if err != nil {
		return fmt.Errorf("failed to validate new serial number: %v", err)
	}

	rawItem := db.RawItem{
		Name:                 itemRequest.Name,
		SerialNumber:         itemRequest.SerialNumber,
		SubcategoryID:        itemRequest.SubcategoryID,
		ItemConditionID:      itemRequest.ConditionID,
		ItemConditionComment: itemRequest.ConditionComment,
		LocationID:           itemRequest.LocationID,
	}

	err = db.InsertItem(&rawItem)
	if err != nil {
		return fmt.Errorf("failed to insert item: %v", err)
	}

	return nil
}
