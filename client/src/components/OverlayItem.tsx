import { useState, useRef, useEffect, useContext } from "react";
import AutosizeInput from "react-input-autosize";

import { Icons } from "./Icons";
import { ItemSelection, CategoriesResponse, ConditionsResponse, ExtendedItem } from "../types/inventory";
import { LocationsResponse } from "../types/locations";

import CloseIcon from "../assets/close.svg";
import EditIcon from "../assets/edit.svg";
import SaveIcon from "../assets/save.svg";
import DeleteIcon from "../assets/delete.svg";
import ExpandCircleDownIcon from "../assets/expand_circle_down.svg";
import CheckIcon from "../assets/check.svg";
import AddIcon from "../assets/add.svg";

import "../styles/overlay_item.css"
import ConditionChip from "./ConditionChip";
import BorrowingStatusChip from "./BorrowingStatusChip";
import LocationBadge from "./LocationBadge";
import CategorySelector from "./CategorySelector";
import { validateSerialNumber } from "../utils/check_serial_number";
import { AuthContext, MessageContext, RequestContext } from "./App";
import { MessageType } from "./MessageList";

function OverlayItem({ locations, categories, conditions, itemSelection, setItems, onClose }: { locations: LocationsResponse; categories: CategoriesResponse, conditions: ConditionsResponse, itemSelection: ItemSelection, setItems: React.Dispatch<React.SetStateAction<ExtendedItem[]>>; onClose: (sn: string, refetch: boolean) => void }) {
    const initialExtendedItem = itemSelection[0]
    const conditionCommentRef = useRef<HTMLTextAreaElement>(null);

    const [ extendedItem, setExtendedItem ] = useState(initialExtendedItem)
    const [ isInitialCreation, setIsInitialCreation ] = useState(itemSelection[2]);
    const [ editMode, setEditMode ] = useState(itemSelection[1])
    const [ editField, setEditField ] = useState<number | null>(null)
    const [ shouldFocusComment, setShouldFocusComment ] = useState(false);

    const CategoryIcon = Icons[extendedItem.subcategory.icon as keyof typeof Icons]
    const timestamp = Date.parse(extendedItem.item.last_update_utc)
    const date = new Date(timestamp)

    const { makeRequest } = useContext(RequestContext);

    const deleteItem = async () => {
        let accessTokenToUse;
        try {
            accessTokenToUse = await validateSession()
        } catch (e) {
            createMessage(MessageType.ERROR, getErrorMessage(e))
            return
        }

        const res = await fetch(`/api/items/${initialExtendedItem.item.serial_number}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + accessTokenToUse
            }
        })

        switch (res.status) {
            case 200:
                createMessage(MessageType.SUCCESS, "Item erfolgreich gelöscht")
                break
            case 401:
                throw new Error("Anfrage nicht autorisiert.")
            case 500:
                throw new Error("Internal Server Error: " + await res.text())
            default:
                throw new Error("Other Error: " + await res.text())
        }
    }

    const postItem = async () => {
        let accessTokenToUse;
        try {
            accessTokenToUse = await validateSession()
        } catch (e) {
            createMessage(MessageType.ERROR, getErrorMessage(e))
            return
        }

        const res = await fetch("/api/items", {
            method: "POST",
            body: JSON.stringify(extendedItem.item),
            headers: {
                "Authorization": "Bearer " + accessTokenToUse
            }
        })

        switch (res.status) {
            case 200:
                createMessage(MessageType.SUCCESS, "Item erfolgreich erstellt")
                break
            case 401:
                throw new Error("Anfrage nicht autorisiert.")
            case 500:
                throw new Error("Internal Server Error: " + await res.text())
            default:
                throw new Error("Other Error: " + await res.text())
        }
    }

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const updateItem = async () => {
        try {
            validateSerialNumber(extendedItem.item.serial_number, extendedItem.subcategory.id)
        } catch (e) {
            throw new Error("Fehler beim Validieren der Seriennummer: " + getErrorMessage(e))
        }

        setItems(currItems => currItems.map(el => {
            if (el.item.serial_number === initialExtendedItem.item.serial_number) {
                return extendedItem
            } else {
                return el
            }
        }))
        
        const changes = getChangedFields(initialExtendedItem.item, extendedItem.item)
        try {
            await makeRequest<undefined>(`/api/items/${initialExtendedItem.item.serial_number}`, {
                method: "PATCH",
                body: JSON.stringify(changes)
            })
        } catch (e) {
            throw new Error("Fehler beim übermitteln der Update Anfrage: " + getErrorMessage(e))
        }
        
        setEditMode(false);
        setEditField(null);
        onClose(extendedItem.item.serial_number, true)
    }

    const updateItemHandled = async () => {
        try {
            await updateItem()
        } catch (e) {
            createMessage(MessageType.ERROR, getErrorMessage(e))
        }
    }

    function getChangedFields(oldObj: {[key: string]: any}, newObj: {[key: string]: any}): {[key: string]: any} {
        const changes: {[key: string]: any}= {};

        for (const key in newObj) {
            if (newObj[key] !== oldObj[key]) {
                changes[key] = newObj[key];
            }
        }

        return changes;
    }

    const updateItemClickHandler = async () => {
        
    }

    useEffect(() => {
        if (shouldFocusComment) {
            if (conditionCommentRef.current === null) {
                alert("No condition comment ref, this is a coding error. Please notify Max.")
                return
            }
            conditionCommentRef.current.focus();
            setShouldFocusComment(false)
        }
    }, [shouldFocusComment])

    const { createMessage } = useContext(MessageContext);
    const { validateSession } = useContext(AuthContext);

    return (
        <div className="item-selected-overlay" onClick={ () => {
            if (editField !== null) {
                setEditField(null)
            } else {
                onClose(extendedItem.item.serial_number, false) 
                setEditField(null)  
            }
        }}>
            <div className="item-selected-wrapper">
                <div
                    className="item-selected"
                    onClick={ (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEditField(null);
                    }}
                >
                    <div className="item-selected-header">
                        <img src={CategoryIcon} className="category-icon" />
                        <h3
                            onClick={
                                editMode ? (
                                    (e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        setEditField(0)
                                    }
                                ) : (
                                    undefined
                                )
                            }
                        >
                            <AutosizeInput
                                type="text"
                                spellCheck={false}
                                className={editMode ? "editable" : ""}
                                readOnly={editField !== 0}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setExtendedItem(oldExtendedItem => {
                                            return {
                                                ...oldExtendedItem,
                                                item: {
                                                    ...oldExtendedItem.item,
                                                    name: e.target.value
                                                }
                                            }
                                        })
                                    }
                                }
                                placeholder="Name wählen"
                                value={extendedItem.item.name}
                            />
                        </h3>
                        <img src={CloseIcon} className="close-icon" onClick={ () => onClose(extendedItem.item.serial_number, false) } />
                    </div>
                    <div className="item-selected-body">
                        <section>
                            <h4>Hauptkategorie</h4>
                            <span
                                onClick={editMode ? (
                                    (e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        setEditField(editField===1?null:1)
                                    }
                                ) : (
                                    undefined
                                )
                            }>
                                {extendedItem.category.id} - {extendedItem.category.name}{editMode && <img src={ExpandCircleDownIcon} />}
                            </span>
                        </section>
                        <section>
                            <h4>Subkategorie</h4>
                            <span
                                onClick={
                                    editMode ? (
                                        (e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            setEditField(editField===1?null:1)
                                        }
                                    ) : (
                                        undefined
                                    )
                                }>

                            {extendedItem.item.subcategory_id} - {extendedItem.subcategory.name}
                            {editMode && <img src={ExpandCircleDownIcon} />}
                            
                            </span>
                            
                            {
                                editField==1 &&
                                <CategorySelector
                                    categories={categories}
                                    preselectedSubcategoryID={extendedItem.item.subcategory_id}
                                    onSelectCallback={
                                        (mainID: number, subID: number, e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            setExtendedItem(oldExtendedItem => {
                                                return {
                                                    ...oldExtendedItem,
                                                    item: {
                                                        ...oldExtendedItem.item,
                                                        subcategory_id: subID,
                                                    },
                                                    category: categories[mainID].main,
                                                    subcategory: categories[mainID].sub[subID]
                                                }
                                            })
                                            setEditField(null)
                                        }
                                    }
                                />
                            }
                        </section>
                        <section>
                            <h4>Seriennummer</h4>
                            <span
                                onClick={
                                    editMode ? (
                                        (e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            setEditField(2)
                                        }
                                    ) : (
                                        undefined
                                    )
                                }
                            >
                            <AutosizeInput
                                name="serial_number"
                                type="text"
                                readOnly={editField!=2}
                                spellCheck={false}
                                placeholder="Seriennummer"
                                className={editMode ? "editable" : ""}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setExtendedItem(oldExtendedItem => {
                                            return {
                                                ...oldExtendedItem,
                                                item: {
                                                    ...oldExtendedItem.item,
                                                    serial_number: e.target.value
                                                }
                                            }
                                        })
                                    }
                                }
                                value={extendedItem.item.serial_number}
                            />
                            </span>
                        </section>
                        <section>
                            <h4>Lagerort</h4>
                            <span
                                onClick={editMode ? (
                                    (e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        setEditField(editField !== 3 ? 3 : null)
                                    }
                                ) : (
                                    undefined
                                )}
                            >
                                <LocationBadge location={extendedItem.location} showDetail={true} showIcon={true} />
                                {editMode && <img src={ExpandCircleDownIcon} />}
                            </span>
                            {editField === 3 && (
                                <ul className="dropdown">
                                    {
                                        Object.keys(locations).map(id => {
                                            return (
                                                <li
                                                    key={id}
                                                    onClick={
                                                        (e: React.MouseEvent) => {
                                                            e.stopPropagation()
                                                            setExtendedItem(currItem => {
                                                                return {
                                                                    ...currItem,
                                                                    item: {
                                                                        ...currItem.item,
                                                                        location_id: parseInt(id)
                                                                    },
                                                                    location: locations[id]
                                                                }
                                                            })

                                                            setEditField(null)
                                                        }
                                                    }
                                                >
                                                    {parseInt(id) === extendedItem.item.location_id && <img src={CheckIcon} alt="Checkmark Icon" />}
                                                    <LocationBadge location={locations[id]} showDetail={true} showIcon={false}/>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            )}
                        </section>
                        <section>
                            <h4>Zustand</h4>
                            <span
                                onClick={editMode ? (
                                    (e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        setEditField(editField!==4 ? 4 : null)
                                    }
                                ) : (
                                    undefined
                                )}
                            >
                                <ConditionChip
                                    conditionID={extendedItem.item.condition_id}
                                    condition={extendedItem.condition}
                                    withIcon={false}
                                />
                                {editMode && <img src={ExpandCircleDownIcon} />}
                            </span>
                            {editField==4 && <ul className="dropdown">
                                {Object.keys(conditions).map(id => {
                                    return (
                                        <li key={id} onClick={() => {
                                            setExtendedItem(oldExtendedItem => ({...oldExtendedItem, item: {...oldExtendedItem.item, condition_id: parseInt(id)}, condition: conditions[id]}))
                                            setEditField(null)
                                        }}>
                                            {parseInt(id) === extendedItem.item.condition_id && <img src={CheckIcon} alt="Checkmark Icon" />}
                                            <ConditionChip
                                                conditionID={parseInt(id)}
                                                condition={conditions[id]}
                                                withIcon={false}
                                            />
                                        </li>
                                    )
                                })}
                            </ul>}
                            <sub>{extendedItem.condition.description}</sub>
                        </section>
                        <section>
                            <h4>Ausleihstatus</h4>
                            <BorrowingStatusChip borrowingEvent={extendedItem.borrowing_event}/>
                        </section>
                        <section>
                            <h4>Zustandskommentar</h4>
                            <span
                                className="condition-comment"
                                onClick={
                                    editMode ? (
                                        (e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            setEditField(5)
                                            setShouldFocusComment(true)
                                        }
                                    ) : (
                                        undefined
                                    )
                                }
                            >
                                {
                                    editField==5 ? (
                                        <textarea
                                            ref={conditionCommentRef}
                                            rows={2}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                const val = e.target.value
                                                setExtendedItem(currExtendedItem => {
                                                    return {
                                                        ...currExtendedItem,
                                                        item: {
                                                            ...currExtendedItem.item,
                                                            condition_comment: val === "" ? "__null__" : val
                                                        }
                                                    }
                                                })
                                            }}
                                            value={extendedItem.item.condition_comment === "__null__" ? "" : extendedItem.item.condition_comment}
                                            placeholder="N/A"
                                        />
                                    ) : (
                                        extendedItem.item.condition_comment=="__null__" ? (
                                            "N/A"
                                        ) : (
                                            extendedItem.item.condition_comment
                                        )
                                    )
                                }
                                {editMode && <img src={EditIcon} />}
                            </span>    
                        </section>
                        <section>
                            <h4>Letztes Update</h4>
                            <span>{date.toLocaleString("de-DE")}</span>
                        </section>
                    </div>

                </div>
                <nav onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {editMode && <section>
                        {!isInitialCreation &&
                            <button
                                className="delete-button"
                                onClick={() => {
                                    deleteItem();
                                    setItems(currItems => currItems.filter(el => el.item.serial_number !== extendedItem.item.serial_number))
                                    onClose(extendedItem.item.serial_number, false)
                                }}
                            >
                                <img src={DeleteIcon}/>
                                Löschen
                            </button>}
                        {isInitialCreation ? (
                            <button
                                className="save-button"
                                onClick={() => {
                                    try {
                                        validateSerialNumber(extendedItem.item.serial_number, extendedItem.subcategory.id)
                                    } catch (e) {
                                        if (e instanceof Error) createMessage(MessageType.ERROR, e.message)
                                        else alert("fatal error, code #2 an max")
                                        return
                                    }
                                    postItem();
                                    setEditMode(false);
                                    setEditField(null);
                                    setItems(currItems => {
                                        const searchedSubcategoryID = extendedItem.item.subcategory_id
                                        const subcategoryStartIndex = currItems.findIndex(currItem => currItem.item.subcategory_id >= searchedSubcategoryID)
                                        const subcategoryEndIndex = currItems.findLastIndex(currItem => currItem.item.subcategory_id <= searchedSubcategoryID) + 1

                                        const extItemRunningNumber = parseInt(extendedItem.item.serial_number.slice(3))
                                        
                                        let insertIndex = subcategoryEndIndex
                                        for (let i = subcategoryStartIndex; i < subcategoryEndIndex; i++) {
                                            const currRunningNumber = parseInt(currItems[i].item.serial_number.slice(3))

                                            if (currRunningNumber > extItemRunningNumber) {
                                                insertIndex = i
                                                break
                                            }
                                        }

                                        const newItems = [...currItems]
                                        newItems.splice(insertIndex, 0, extendedItem)

                                        return newItems
                                    })

                                    onClose(extendedItem.item.serial_number, false)
                                }}
                            >
                                <img src={AddIcon} alt="Add Icon"/>
                                Erstellen
                            </button>
                        ) : (
                            <button
                                className="save-button"
                                onClick={updateItemHandled}
                            >
                                <img src={SaveIcon} alt="Save Icon" />
                                Speichern
                            </button>
                        )}
                    </section>}
                    {editMode &&
                        <button
                            onClick={
                                () => {
                                    if (isInitialCreation) {
                                        onClose(extendedItem.item.serial_number, false);
                                    } else {
                                        setEditMode(false);
                                        setEditField(null);
                                    }
                                }
                            }
                        >
                            Abbrechen
                        </button>}
                    {!editMode && <button className="edit-button" onClick={() => setEditMode(true)}><img src={EditIcon} />Bearbeiten</button>}
                </nav>
            </div>
        </div>
    )
}

export default OverlayItem