package inventory

import (
	"fmt"
	"time"

	"github.com/bm-dynamics/buewi-tech/server/internal/borrowing"
	"github.com/bm-dynamics/buewi-tech/server/internal/db"
	"github.com/bm-dynamics/buewi-tech/server/internal/locations"
)

type Item struct {
	Name             string `json:"name"`
	SerialNumber     string `json:"serial_number"`
	SubcategoryID    int    `json:"subcategory_id"`
	ConditionID      int    `json:"condition_id"`
	ConditionComment string `json:"condition_comment"`
	LastUpdateUTC    string `json:"last_update_utc"`
	LocationID       int    `json:"location_id"`
}

type ExtendedItem struct {
	Item           *Item                     `json:"item"`
	Category       *Category                 `json:"category"`
	Subcategory    *Subcategory              `json:"subcategory"`
	Condition      *Condition                `json:"condition"`
	BorrowingEvent *borrowing.BorrowingEvent `json:"borrowing_event"`
	Location       *locations.Location       `json:"location"`
}

func GetItem(serialNumber string) (*ExtendedItem, error) {
	rawItem, err := db.GetItemBySerialNumber(serialNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get item by serial number: %v", err)
	}

	if rawItem == nil {
		return nil, nil
	}

	item, err := processRawItems([]*db.RawItem{rawItem})
	if err != nil {
		return nil, fmt.Errorf("failed to process raw item: %v", err)
	}

	return item[0], nil
}

func GetAllItems() ([]*ExtendedItem, error) {
	rawItems, err := db.GetAllItems()
	if err != nil {
		return nil, fmt.Errorf("failed to get all items from db: %v", err)
	}

	return processRawItems(rawItems)
}

func processRawItems(rawItems []*db.RawItem) ([]*ExtendedItem, error) {
	bigCategories, err := GetBigCategories()
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %v", err)
	}

	conditions, err := GetConditions()
	if err != nil {
		return nil, fmt.Errorf("failed to get conditions: %v", err)
	}

	locations, err := locations.GetLocations()
	if err != nil {
		return nil, fmt.Errorf("failed to get locations: %v", err)
	}

	activeBorrowingEvents, err := borrowing.GetActiveEvents()
	if err != nil {
		return nil, fmt.Errorf("failed to get active borrowing events: %v", err)
	}

	loc, _ := time.LoadLocation("UTC")

	var extendedItems []*ExtendedItem
	for _, rawItem := range rawItems {
		parsedTime, err := time.ParseInLocation(time.DateTime, rawItem.LastUpdate, loc)
		timestamp := parsedTime.Format(time.RFC3339)

		baseItem := Item{
			Name:             rawItem.Name,
			SerialNumber:     rawItem.SerialNumber,
			SubcategoryID:    rawItem.SubcategoryID,
			ConditionID:      rawItem.ItemConditionID,
			ConditionComment: *rawItem.ItemConditionComment,
			LastUpdateUTC:    timestamp,
			LocationID:       rawItem.LocationID,
		}

		categoryID, err := getCategoryIDForSubcategoryID(rawItem.SubcategoryID)
		if err != nil {
			return nil, fmt.Errorf("failed to get category: %v", err)
		}

		itemBigCategory := bigCategories[categoryID]

		extendedItem := ExtendedItem{
			Item:           &baseItem,
			Category:       itemBigCategory.Main,
			Subcategory:    itemBigCategory.Sub[baseItem.SubcategoryID],
			Condition:      conditions[baseItem.ConditionID],
			BorrowingEvent: activeBorrowingEvents[baseItem.SerialNumber],
			Location:       locations[baseItem.LocationID],
		}

		if extendedItem.Category == nil || extendedItem.Subcategory == nil || extendedItem.Condition == nil || extendedItem.Location == nil {
			return nil, fmt.Errorf("required extended item field is nil")
		}

		extendedItems = append(extendedItems, &extendedItem)
	}

	return extendedItems, nil
}
