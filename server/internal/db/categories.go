package db

import "fmt"

type RawCategory struct {
	ID   int
	Name string
}

type RawSubcategory struct {
	ID   int
	Name string
	Icon string
}

func GetCategoryIDForSubcategoryID(subcategoryID int) (int, error) {
	rows, err := db.Query("SELECT category_id FROM categories_subcategories WHERE subcategory_id = ?", subcategoryID)
	if err != nil {
		return 0, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rows.Next()
	var categoryID int
	err = rows.Scan(&categoryID)

	if rows.Next() {
		return 0, fmt.Errorf("unexpectedly got more than one row")
	}

	return categoryID, nil
}

func GetCategoryByID(categoryID int) (*RawCategory, error) {
	rows, err := db.Query("SELECT * FROM categories WHERE id = ?", categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rows.Next()
	var category RawCategory
	err = rows.Scan(&category.ID, &category.Name)

	if rows.Next() {
		return nil, fmt.Errorf("unexpectedly got more than one row")
	}

	return &category, nil
}

func GetSubcategoryByID(subcategoryID int) (*RawSubcategory, error) {
	rows, err := db.Query("SELECT * FROM subcategories WHERE id = ?", subcategoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rows.Next()
	var subcategory RawSubcategory
	err = rows.Scan(&subcategory.ID, &subcategory.Name, &subcategory.Icon)

	if rows.Next() {
		return nil, fmt.Errorf("unexpectedly got more than one row")
	}

	return &subcategory, nil
}

func GetCategories() ([]*RawCategory, error) {
	rows, err := db.Query("SELECT * FROM categories;")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var categories []*RawCategory
	for rows.Next() {
		var category RawCategory
		err = rows.Scan(&category.ID, &category.Name)
		categories = append(categories, &category)
	}

	return categories, nil
}

func GetSubcategories() ([]*RawSubcategory, error) {
	rows, err := db.Query("SELECT * FROM subcategories;")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var subcategories []*RawSubcategory
	for rows.Next() {
		var subcategory RawSubcategory
		err = rows.Scan(&subcategory.ID, &subcategory.Name, &subcategory.Icon)
		subcategories = append(subcategories, &subcategory)
	}

	return subcategories, nil
}

func GetSubcategoriesForCategoryID(categoryID int) ([]*RawSubcategory, error) {
	rows, err := db.Query("SELECT * FROM subcategories WHERE id IN (SELECT subcategory_id FROM categories_subcategories WHERE category_id = ?)", categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var subcategories []*RawSubcategory
	for rows.Next() {
		var subcategory RawSubcategory
		err := rows.Scan(&subcategory.ID, &subcategory.Name, &subcategory.Icon)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		subcategories = append(subcategories, &subcategory)
	}

	return subcategories, nil
}
