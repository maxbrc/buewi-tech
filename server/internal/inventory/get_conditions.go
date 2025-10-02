package inventory

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type Condition struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

/* func getCondition(conditionID int) (*Condition, error) {
	rawCondition, err := db.GetConditionByID(conditionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get condition with id %v: %v", conditionID, err)
	}

	condition := Condition{
		ID:          rawCondition.ID,
		Name:        rawCondition.Name,
		Description: rawCondition.Description,
	}

	return &condition, nil
} */

func GetConditions() (map[int]*Condition, error) {
	conditions := make(map[int]*Condition)

	rawConditions, err := db.GetConditions()
	if err != nil {
		return nil, fmt.Errorf("failed to get conditions: %v", err)
	}

	for _, rawCondition := range rawConditions {
		conditions[rawCondition.ID] = &Condition{
			ID:          rawCondition.ID,
			Name:        rawCondition.Name,
			Description: rawCondition.Description,
		}
	}

	return conditions, nil
}
