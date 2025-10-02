package locations

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type Location struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	BuildingName string `json:"building_name"`
	Room         string `json:"room"`
}

func GetLocations() (map[int]*Location, error) {
	rawBuildings, err := db.GetBuildings()
	if err != nil {
		return nil, fmt.Errorf("failed to get buildings: %v", err)
	}

	buildings := make(map[int]string)
	for _, rawBuilding := range rawBuildings {
		buildings[rawBuilding.ID] = rawBuilding.Name
	}

	rawLocations, err := db.GetLocations()
	if err != nil {
		return nil, fmt.Errorf("failed to get locations from db: %v", err)
	}

	locations := make(map[int]*Location)
	for _, rawLoc := range rawLocations {
		location := Location{
			ID:           rawLoc.ID,
			Name:         rawLoc.Name,
			BuildingName: buildings[rawLoc.BuildingID],
			Room:         rawLoc.Room,
		}

		locations[rawLoc.ID] = &location
	}

	return locations, nil
}
