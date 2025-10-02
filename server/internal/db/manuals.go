package db

import "fmt"

type RawManual struct {
	UUID             string
	ItemSerialNumber string
}

func GetManuals() ([]*RawManual, error) {
	rows, err := db.Query("SELECT * FROM manuals")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var manuals []*RawManual
	for rows.Next() {
		var manual RawManual
		err := rows.Scan(&manual.UUID, &manual.ItemSerialNumber)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		manuals = append(manuals, &manual)
	}

	return manuals, nil
}

func InsertManual(rawManual *RawManual) error {
	_, err := db.Exec("INSERT INTO manuals VALUES (?, ?)", rawManual.UUID, rawManual.ItemSerialNumber)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func DeleteManual(uuid string) error {
	res, err := db.Exec("DELETE FROM manuals WHERE uuid = ?", uuid)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get number of affected rows: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no manual with that uuid")
	}

	return nil
}
