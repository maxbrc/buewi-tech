import { CategoriesResponse } from "../types/inventory";

import CheckIcon from "../assets/check.svg";

function CategorySelector({ categories, onSelectCallback, preselectedSubcategoryID }: { categories: CategoriesResponse; onSelectCallback: (mainID: number, subID: number, e: React.MouseEvent) => void; preselectedSubcategoryID?: number; }) {
    return (
        <ul className="dropdown category-dropdown">
            {
                Object.keys(categories).map(id => {
                    return (
                        <li key={id}>{id}: {categories[id].main.name}
                            <ul className="nested-list">
                            {
                                Object.keys(categories[id].sub).map(subID => {
                                    return <li key={subID} onClick={(e: React.MouseEvent) => onSelectCallback(parseInt(id), parseInt(subID), e)}>
                                        {parseInt(subID) === preselectedSubcategoryID && <img src={CheckIcon} alt="Checkmark Icon" />}
                                        {subID}: {categories[id].sub[subID].name}
                                    </li>
                                })
                            }
                            </ul>
                        </li>
                    )
                }) 
            }
        </ul>
    )
}

export default CategorySelector