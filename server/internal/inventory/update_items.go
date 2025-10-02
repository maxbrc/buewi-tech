package inventory

import (
	"encoding/json"
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type ItemPatchRequest struct {
	Name             *string `json:"name"`
	SerialNumber     *string `json:"serial_number"`
	SubcategoryID    *int    `json:"subcategory_id"`
	ConditionID      *int    `json:"condition_id"`
	ConditionComment *string `json:"condition_comment"`
	LocationID       *int    `json:"location_id"`
}

func UpdateItem(serialNumber string, reqBody []byte) error {
	var patchRequest ItemPatchRequest
	err := json.Unmarshal(reqBody, &patchRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	rawItemUpdate := db.RawItemUpdate{
		Name:             patchRequest.Name,
		SerialNumber:     patchRequest.SerialNumber,
		SubcategoryID:    patchRequest.SubcategoryID,
		ConditionID:      patchRequest.ConditionID,
		ConditionComment: patchRequest.ConditionComment,
		LocationID:       patchRequest.LocationID,
	}

	err = db.UpdateItem(serialNumber, &rawItemUpdate)
	if err != nil {
		return fmt.Errorf("failed to update item: %v", err)
	}

	return nil
}
