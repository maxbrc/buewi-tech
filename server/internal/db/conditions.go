package db

import "fmt"

type RawCondition struct {
	ID          int
	Name        string
	Description string
}

func GetConditionByID(conditionID int) (*RawCondition, error) {
	rows, err := db.Query("SELECT * FROM conditions WHERE id = ?", conditionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rows.Next()
	var condition RawCondition
	rows.Scan(&condition.ID, &condition.Name, &condition.Description)

	if rows.Next() {
		return nil, fmt.Errorf("unexpectedly got more than one row")
	}

	return &condition, nil
}

func GetConditions() ([]*RawCondition, error) {
	rows, err := db.Query("SELECT * FROM conditions;")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var conditions []*RawCondition
	for rows.Next() {
		var condition RawCondition
		err := rows.Scan(&condition.ID, &condition.Name, &condition.Description)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		conditions = append(conditions, &condition)
	}

	return conditions, nil
}
