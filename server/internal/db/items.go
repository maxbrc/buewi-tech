package db

import (
	"database/sql"
	"fmt"
	"strings"
)

type RawItem struct {
	Name                 string
	SerialNumber         string
	SubcategoryID        int
	ItemConditionID      int
	ItemConditionComment *string
	LastUpdate           string
	LocationID           int
}

type RawItemUpdate struct {
	Name             *string
	SerialNumber     *string
	SubcategoryID    *int
	ConditionID      *int
	ConditionComment *string
	LocationID       *int
}

var nullValue string = "__null__"

func GetItemBySerialNumber(serialNumber string) (*RawItem, error) {
	rows, err := db.Query("SELECT * FROM items WHERE serial_number = ?", serialNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rowAvailable := rows.Next()
	if !rowAvailable {
		return nil, nil
	}

	var item RawItem
	err = rows.Scan(&item.Name, &item.SerialNumber, &item.SubcategoryID, &item.ItemConditionID, &item.ItemConditionComment, &item.LastUpdate, &item.LocationID)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	if item.ItemConditionComment == nil {
		item.ItemConditionComment = &nullValue
	}

	return &item, nil
}

func GetSerialNumbersForSubcategoryID(subcategoryID int) ([]string, error) {
	rows, err := db.Query("SELECT serial_number FROM items WHERE subcategory_id = ? ORDER BY serial_number ASC", subcategoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var serialNumbers []string
	for rows.Next() {
		var sn string
		err := rows.Scan(&sn)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		serialNumbers = append(serialNumbers, sn)
	}

	return serialNumbers, nil
}

func GetAllItems() ([]*RawItem, error) {
	rows, err := db.Query("SELECT * FROM items ORDER BY serial_number ASC")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	return processItemRows(rows)
}

func processItemRows(rows *sql.Rows) ([]*RawItem, error) {
	var allItems []*RawItem
	for rows.Next() {
		var item RawItem

		err := rows.Scan(&item.Name, &item.SerialNumber, &item.SubcategoryID, &item.ItemConditionID, &item.ItemConditionComment, &item.LastUpdate, &item.LocationID)
		if err != nil {
			return nil, fmt.Errorf("failed to read row: %v", err)
		}

		if item.ItemConditionComment == nil {
			item.ItemConditionComment = &nullValue
		}

		allItems = append(allItems, &item)
	}

	return allItems, nil
}

func InsertItem(item *RawItem) error {
	args := []any{item.Name, item.SerialNumber, item.SubcategoryID, item.ItemConditionID, item.ItemConditionComment, item.LocationID}
	_, err := db.Exec("INSERT INTO items (name, serial_number, subcategory_id, item_condition, item_condition_comment, location_id) VALUES (?, ?, ?, ?, ?, ?)", args...)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func DeleteItem(serialNumber string) error {
	res, err := db.Exec("DELETE FROM items WHERE serial_number = ?", serialNumber)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get the affected number of rows: %v", err)
	}
	if rowsAffected != 1 {
		return fmt.Errorf("unexpectedly other than 1 row affected")
	}

	return nil
}

func UpdateItem(serialNumber string, updateItem *RawItemUpdate) error {
	query := "UPDATE items SET"
	var args []any
	var values []string
	if updateItem.Name != nil {
		values = append(values, "name = ?")
		args = append(args, updateItem.Name)
	}
	if updateItem.SerialNumber != nil {
		values = append(values, "serial_number = ?")
		args = append(args, updateItem.SerialNumber)
	}
	if updateItem.SubcategoryID != nil {
		values = append(values, "subcategory_id = ?")
		args = append(args, updateItem.SubcategoryID)
	}
	if updateItem.ConditionID != nil {
		values = append(values, "item_condition = ?")
		args = append(args, updateItem.ConditionID)
	}
	if updateItem.ConditionComment != nil {
		values = append(values, "item_condition_comment = ?")
		if *updateItem.ConditionComment == "__null__" {
			args = append(args, nil)
		} else {
			args = append(args, updateItem.ConditionComment)
		}

	}
	if updateItem.LocationID != nil {
		values = append(values, "location_id = ?")
		args = append(args, updateItem.LocationID)
	}

	if len(values) == 0 {
		return fmt.Errorf("received empty update")
	}

	query += " " + strings.Join(values, ", ") + " WHERE serial_number = ?"
	args = append(args, serialNumber)

	res, err := db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get the affected number of rows: %v", err)
	}
	if rowsAffected != 1 {
		return fmt.Errorf("unexpectedly other than 1 row affected")
	}

	return nil
}
