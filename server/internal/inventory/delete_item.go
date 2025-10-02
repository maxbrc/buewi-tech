package inventory

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

func RemoveItem(serialNumber string) error {
	err := db.DeleteItem(serialNumber)
	if err != nil {
		return fmt.Errorf("failed to remove item: %v", err)
	}

	return nil
}
