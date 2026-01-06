import { useState, useEffect, useCallback, useContext } from "react";
import OverlayItem from "./OverlayItem";
import InventoryList from "./InventoryList";
import CategorySelector from "./CategorySelector";
import AutosizeInput from "react-input-autosize";
import "../styles/inventory.css";

import SearchIcon from "../assets/search.svg";
import CheckIcon from "../assets/check.svg";
import ArrowDownIcon from "../assets/arrow_down.svg";
import AddIcon from "../assets/add.svg";
import ResetSettingsIcon from "../assets/reset_settings.svg";
import ExpandCircleDownIcon from "../assets/expand_circle_down.svg";
import CloseIcon from "../assets/close.svg";

import { ExtendedItem, CategoriesResponse, ConditionsResponse, ItemSelection, Subcategory, Item } from "../types/inventory";
import { LocationsResponse } from "../types/locations";
import { AuthContext, MessageContext, PopupContext, RequestContext } from "./App";
import { validateSerialNumber } from "../utils/check_serial_number";
import { MessageType } from "./MessageList";
import { useOutletContext } from "react-router";

function CategoryPopup({ onNext, onClose, categories }: { onNext: (selectedMainID: number, selectedSubID: number, selectedName: string) => void; onClose: () => void; categories: CategoriesResponse; }) {
    const [ categoryID, setCategoryID ] = useState<number>(0);
    const [ subcategoryID, setSubcategoryID ] = useState<number>(0);
    const [ name, setName ] = useState("");

    const { createMessage } = useContext(MessageContext);

    const [ dropdownOpen, setDropdownOpen ] = useState(false);

    const handleContinue = () => {
        if (!(categoryID && subcategoryID && name)) {
            createMessage(MessageType.ERROR, "Bitte Name und Kategorie wählen")
            return
        }

        onNext(categoryID, subcategoryID, name)
    }

    useEffect(() => {
        document.body.addEventListener("click", () => setDropdownOpen(false))
    }, [])

    return (
        <>
            <img
                className="close-icon"
                src={CloseIcon}
                alt="Close Icon"
                onClick={onClose}
            />
            <h2>Item Erstellung</h2>
            <span>1. Name wählen</span>
            <AutosizeInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                value={name}
                placeholder="Bezeichnung"
            />
            <span>2. Kategorie wählen</span>
            <span
                className="dropdown-header"
                onClick={
                    (e: React.MouseEvent) => {
                        e.stopPropagation()
                        setDropdownOpen(currOpen => !currOpen)
                    }
                }
            >{subcategoryID === 0 || categoryID === 0 ? "Keine Kategorie gewählt" : `${subcategoryID}: ${categories[categoryID].sub[subcategoryID].name}`}<img src={ExpandCircleDownIcon} alt="Expand Icon" />
                        {dropdownOpen && <CategorySelector
                categories={categories}
                preselectedSubcategoryID={subcategoryID}
                onSelectCallback={
                    (mainID: number, subID: number) => {
                        setCategoryID(mainID)
                        setSubcategoryID(subID)
                    }
                }
            />}
            </span>

            <button
                onClick={handleContinue}
            >Weiter</button>
        </>
    )
}

function SerialNumberPopup({ onNext, onClose, items, selectedSubcategory }: { onNext: (serialNumber: string) => void; onClose: () => void; items: ExtendedItem[]; selectedSubcategory: Subcategory; }) {
    const [ serialNumber, setSerialNumber ] = useState<string>("");
    const [ automaticSerialNumber, setAutomaticSerialNumber ] = useState<string>("");
    const [ usedSerialNumbers, setUsedSerialNumbers ] = useState<string[]>([]);

    useEffect(() => {
        const serialNumbers: string[] = items.filter(el => el.item.subcategory_id === selectedSubcategory.id).map(el => el.item.serial_number)

        setUsedSerialNumbers(serialNumbers)
        
        let newRunningNumber;
        if (serialNumbers.length === 0) {
            newRunningNumber = "001"
        } else {
            const lastSerialNumber = serialNumbers[serialNumbers.length-1]
            const lastRunningNumber = parseInt(lastSerialNumber.slice(3))
            newRunningNumber = (lastRunningNumber + 1).toString().padStart(3, "0")
        }
        
        const newSerialNumber = selectedSubcategory.id + "-" + newRunningNumber

        setAutomaticSerialNumber(newSerialNumber)
        setSerialNumber(newSerialNumber)
    }, [])

    const { createMessage } = useContext(MessageContext);

    return (
        <>
            <img
                className="close-icon"
                src={CloseIcon}
                alt="Close Icon"
                onClick={onClose}
            />
            <h2>Item Erstellung</h2>
            <span>3. Seriennummer wählen</span>

            <span>Automatisch gewählte SN: {automaticSerialNumber}</span>
            <span>Seriennummer anpassen:</span>
            <AutosizeInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSerialNumber(e.target.value)}
                value={serialNumber}
                placeholder="Seriennummer"
            />

            <button
                onClick={() => {
                    try {
                        validateSerialNumber(serialNumber, selectedSubcategory.id)
                    } catch (e) {
                        if (e instanceof Error) createMessage(MessageType.ERROR, e.message)
                        else alert("etwas ist ernshaft falschgelaufen, code #1 an Max")
                        return
                    }

                    if (usedSerialNumbers.includes(serialNumber)) {
                        createMessage(MessageType.ERROR, "Diese Seriennummer ist in Verwendung")
                        return
                    }
                    
                    onNext(serialNumber)
                }}
            >Weiter</button>
        </>
    )
}

function Inventory() {
    const [ categories, setCategories ] = useState<CategoriesResponse>({})
    const [ conditions, setConditions ] = useState<ConditionsResponse>({})
    const [ locations, setLocations ] = useState<LocationsResponse>({});
    const [ items, setItems ] = useState<ExtendedItem[]>([]);

    const [ filteredItems, setFilteredItems ] = useState<ExtendedItem[]>([]);
    const [ search, setSearch ] = useState<string>("");
    const [ timerID, setTimerID ] = useState<number>();
    const [ searchCategoryID, setSearchCategoryID ] = useState<number>(0);
    const [ categorySearchOpen, setCategorySearchOpen ] = useState(false);
    const [ borrowingStatusSearch, setBorrowingStatusSearch ] = useState<number | null>(null);
    const [ itemToRefetch, setItemToRefetch ] = useState<string | null>(null);

    const [ selectedItem, setSelectedItem ] = useState<ItemSelection | null>(null);

    const { makeRequest } = useContext(RequestContext);
    const { createMessage } = useContext(MessageContext);

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const fetchData = async () => {
        let conditionsResponse: ConditionsResponse;
        try {
            conditionsResponse = await makeRequest<ConditionsResponse>("/api/conditions")
        } catch (e) {
            throw new Error("Fehler beim Abrufen der Zustände: " + getErrorMessage(e))
        }
        setConditions(conditionsResponse)
        
        let categoriesResponse: CategoriesResponse;
        try {
            categoriesResponse = await makeRequest<CategoriesResponse>("/api/categories")
        } catch (e) {
            throw new Error("Fehler beim Abrufen der Kategorien: " + getErrorMessage(e))
        }
        setCategories(categoriesResponse)

        let locationsResponse: LocationsResponse;
        try {
            locationsResponse = await makeRequest<LocationsResponse>("/api/locations")
        } catch (e) {
            throw new Error("Fehler beim Abrufen der Locations: " + getErrorMessage(e))
        }
        setLocations(locationsResponse)

        let itemsResponse: ExtendedItem[];
        try {
            itemsResponse = await makeRequest<ExtendedItem[]>("/api/items")
        } catch (e) {
            throw new Error("Fehler beim Abrufen der Items: " + getErrorMessage(e))
        }

        setItems(itemsResponse)
    }

    const refetchAndUpdateItem = async (serialNumber: string): Promise<void> => {
        let newItem: ExtendedItem;
        try {
            newItem = await makeRequest<ExtendedItem>(`/api/items/${serialNumber}`)
        } catch (e) {
            throw new Error("Fehler beim Refetching des Items: " + getErrorMessage(e))
        }

        setItems(currItems => currItems.map(el => {
            if (el.item.serial_number === serialNumber) return newItem
            else return el
        }))
    }

    useEffect(() => {
        if (itemToRefetch === null) return
        setTimeout(() => refetchAndUpdateItem(itemToRefetch).then(() => setItemToRefetch(null)), 1000)
    }, [itemToRefetch])

    useEffect(() => {
        filterItems()
    }, [items, search, searchCategoryID])

    useEffect(() => {
        document.body.style.overflow = selectedItem === null ? "unset" : "hidden"
    }, [selectedItem])

    useEffect(() => {
        fetchData().catch(e => createMessage(MessageType.ERROR, getErrorMessage(e)))
        document.body.addEventListener("click", () => {
            setCategorySearchOpen(false)
        })
    }, [])

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchInput = e.target.value
        setSearch(searchInput)
    }

    const filterItems = () => {
        clearTimeout(timerID)
        const newTimerID = setTimeout(() => {
            const newFilteredItems = items.filter(el => {
                const searchMatched = search === "" || el.subcategory.name.includes(search) || el.category.name.includes(search) || el.item.name.includes(search) || el.item.serial_number.includes(search)
                const categoryMatched = searchCategoryID === 0 || searchCategoryID === el.category.id

                return searchMatched && categoryMatched
            }) 
            setFilteredItems(newFilteredItems)
        }, 50)
        setTimerID(newTimerID)
    }

    const resetSearch = () => {
        setSearchCategoryID(0)
        setCategorySearchOpen(false)
    }

    const resetSearchCallback = useCallback(() => {
        resetSearch()
    }, [])

    const { showPopup, closePopup } = useContext(PopupContext);

    const createCreationItem = (mainID: number, subID: number, name: string, sn: string) => {
        const baseItem: Item = {
            name: name,
            serial_number: sn,
            subcategory_id: subID,
            condition_id: 1,
            condition_comment: "__null__",
            last_update_utc: new Date(Date.now()).toISOString(),
            location_id: 1,
        }

        const extendedItem: ExtendedItem = {
            item: baseItem,
            category: categories[mainID].main,
            subcategory: categories[mainID].sub[subID],
            condition: conditions[baseItem.condition_id],
            borrowing_event: null,
            location: locations[baseItem.location_id]
        }


        setSelectedItem([extendedItem, true, true])
    }

    const handleItemCreation = () => {
        showPopup(
            <CategoryPopup
                categories={categories}
                onClose={closePopup}
                onNext={(selectedMainID, selectedSubID, selectedName) => {
                    showPopup(
                        <SerialNumberPopup
                            onNext={(selectedSerialNumber) => {
                                closePopup()
                                createCreationItem(selectedMainID, selectedSubID, selectedName, selectedSerialNumber)
                            }}
                            onClose={closePopup}
                            items={items}
                            selectedSubcategory={categories[selectedMainID].sub[selectedSubID]}
                        />
                    )
                }}
            />
        )
    }

    return (
        <>
            <h2>Inventar</h2>
            <div className="search-box">
                <div>
                    <img src={SearchIcon} />
                    <input
                        type="text"
                        placeholder="Name, Seriennummer oder Kategorie"
                        onChange={handleSearchInputChange}
                        value={search}
                    />
                </div>
                <div
                    onClick={
                        (e: React.MouseEvent) => {
                            e.stopPropagation()
                            setCategorySearchOpen(currOpen => !currOpen)
                        }
                    }
                >
                    <span>{searchCategoryID === 0 ? "Alle Kategorien" : categories[searchCategoryID].main.name}</span>
                    <img src={ArrowDownIcon} alt="Dropdown Icon" />
                    {categorySearchOpen && <ul className="dropdown">
                        <li
                            onClick={
                                () => {
                                    setSearchCategoryID(0)
                                }
                            }
                        >
                            {0 === searchCategoryID && <img src={CheckIcon} alt="Check Icon" />}
                            Alle Kategorien
                        </li>
                        {
                            Object.keys(categories).map(id => {
                                return (
                                    <li
                                        key={id}
                                        onClick={
                                            () => {
                                                setSearchCategoryID(parseInt(id))
                                            }
                                        }
                                    >
                                        {parseInt(id) === searchCategoryID && <img src={CheckIcon} alt="Check Icon" />}
                                        {categories[id].main.name}
                                    </li>
                                )
                            })
                        }
                    </ul>}
                </div>
                <button
                    onClick={resetSearch}
                >
                    <img src={ResetSettingsIcon} alt="Reset Icon" />
                    Filter zurücksetzen
                </button>
                <hr />
                <button
                    className="add-item"
                    onClick={handleItemCreation}
                >
                    <img src={AddIcon} alt="Add Icon" />
                    Item hinzufügen
                </button>
            </div>
            <InventoryList extendedItems={filteredItems} setSelectedItem={setSelectedItem} callbackFn={resetSearchCallback} />
            {
                selectedItem!=null &&
                <OverlayItem
                    locations={locations}
                    categories={categories}
                    conditions={conditions}
                    itemSelection={selectedItem}
                    setItems={setItems}
                    onClose={
                        (refetchSn?: string) => {
                            if (refetchSn !== undefined) setItemToRefetch(refetchSn)

                            setSelectedItem(null)
                        }
                    }
            />}
        </>
    )
}

export default Inventory