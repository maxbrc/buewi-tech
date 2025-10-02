package inventory

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Subcategory struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type BigCategory struct {
	Main *Category            `json:"main"`
	Sub  map[int]*Subcategory `json:"sub"`
}

// We use this object structure for lookups by ID

func getCategoryIDForSubcategoryID(subcategoryID int) (int, error) {
	categoryID, err := db.GetCategoryIDForSubcategoryID(subcategoryID)
	if err != nil {
		return 0, fmt.Errorf("failed to get category id for subcategory id %v: %v", subcategoryID, err)
	}

	return categoryID, nil
}

/* func getSubcategoryByID(subcategoryID int) (*Subcategory, error) {
	rawSubcategory, err := db.GetSubcategoryByID(subcategoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subcategory with id %v: %v", subcategoryID, err)
	}

	subcategory := Subcategory{
		ID:   rawSubcategory.ID,
		Name: rawSubcategory.Name,
	}

	return &subcategory, nil
} */

func GetBigCategories() (map[int]*BigCategory, error) {
	response := make(map[int]*BigCategory)

	rawCategories, err := db.GetCategories()
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %v", err)
	}

	for _, rawCat := range rawCategories {
		var bigCategory BigCategory

		bigCategory.Main = &Category{
			ID:   rawCat.ID,
			Name: rawCat.Name,
		}

		rawSubcategories, err := db.GetSubcategoriesForCategoryID(rawCat.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get subcategories: %v", err)
		}

		subcategories := make(map[int]*Subcategory)
		for _, rawSubcat := range rawSubcategories {
			subcategories[rawSubcat.ID] = &Subcategory{
				ID:   rawSubcat.ID,
				Name: rawSubcat.Name,
				Icon: rawSubcat.Icon,
			}
		}

		bigCategory.Sub = subcategories

		response[rawCat.ID] = &bigCategory
	}

	return response, nil
}
