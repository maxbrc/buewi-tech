package manuals

import (
	"fmt"
	"os"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

func CreateManual(data []byte, uuid, item_serial_number string) error {
	rawManual := db.RawManual{
		UUID:             uuid,
		ItemSerialNumber: item_serial_number,
	}

	err := os.WriteFile(fmt.Sprintf("files/%s.pdf", uuid), data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write file: %v", err)
	}

	err = db.InsertManual(&rawManual)
	if err != nil {
		return fmt.Errorf("failed to insert manual into db: %v", err)
	}

	return nil
}
