package manuals

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type Manual struct {
	UUID             string `json:"uuid"`
	ItemSerialNumber string `json:"item_serial_number"`
	ItemName         string `json:"item_name"`
}

func GetManuals() ([]*Manual, error) {
	rawManuals, err := db.GetManuals()
	if err != nil {
		return nil, fmt.Errorf("failed to get manuals from db: %v", err)
	}

	manuals := make([]*Manual, len(rawManuals))

	for i, rawManual := range rawManuals {
		rawItem, err := db.GetItemBySerialNumber(rawManual.ItemSerialNumber)
		if err != nil {
			return nil, fmt.Errorf("failed to get item: %v", err)
		}

		manual := Manual{
			UUID:             rawManual.UUID,
			ItemSerialNumber: rawManual.ItemSerialNumber,
			ItemName:         rawItem.Name,
		}

		manuals[i] = &manual
	}

	return manuals, nil
}
