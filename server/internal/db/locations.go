package db

import "fmt"

type RawBuilding struct {
	ID   int
	Name string
}

type RawLocation struct {
	ID         int
	Name       string
	BuildingID int
	Room       string
}

func GetBuildings() ([]*RawBuilding, error) {
	rows, err := db.Query("SELECT * FROM buildings")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var buildings []*RawBuilding
	for rows.Next() {
		var building RawBuilding
		err := rows.Scan(&building.ID, &building.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		buildings = append(buildings, &building)
	}

	return buildings, nil
}

func GetLocations() ([]*RawLocation, error) {
	rows, err := db.Query("SELECT * FROM locations")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var locations []*RawLocation
	for rows.Next() {
		var location RawLocation
		err := rows.Scan(&location.ID, &location.Name, &location.BuildingID, &location.Room)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		locations = append(locations, &location)
	}

	return locations, nil
}
