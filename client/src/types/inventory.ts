import { BorrowingEvent } from "./borrowing";
import { Location } from "./locations";

interface Item {
    name: string;
    serial_number: string;
    subcategory_id: number;
    condition_id: number;
    condition_comment: string;
    last_update_utc: string;
    location_id: number;
}

interface ExtendedItem {
    item: Item;
    category: Category;
    subcategory: Subcategory;
    condition: Condition;
    borrowing_event: BorrowingEvent | null;
    location: Location;
}

// Item, Edit Mode, Initial Creation
type ItemSelection = [ExtendedItem, boolean, boolean]

interface BigCategory {
    main: Category;
    sub: {
        [key: string]: Subcategory;
    };
}

type CategoriesResponse = {
    [key: string]: BigCategory;
}

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    icon: string;
}

interface Condition {
    id: number;
    name: string;
    description: string;
}

type ConditionsResponse = {
    [key: string]: Condition;
}

export { Item, CategoriesResponse, ConditionsResponse, ItemSelection, ExtendedItem, Subcategory }