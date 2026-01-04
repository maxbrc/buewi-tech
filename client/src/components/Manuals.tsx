import { useState, useEffect, useContext } from "react";
import { v4 as uuid } from "uuid";

import { Manual } from "../types/manuals";
import { MessageType } from "./MessageList";
import { AuthContext, MessageContext, PopupContext, RequestContext } from "./App";
import "../styles/manual.css";
import { ExtendedItem } from "../types/inventory";

import SearchIcon from "../assets/search.svg";
import NoteAddIcon from "../assets/note_add.svg";
import CloseIcon from "../assets/close.svg";
import AutosizeInput from "react-input-autosize";
import EyeIcon from "../assets/eye.svg";
import { validateSerialNumberFormat } from "../utils/check_serial_number";

function ManualUploadPopup({ onNext, onClose }: { onNext: (file: File) => void; onClose: () => void; }) {
    const [ files, setFiles ] = useState<FileList | null>(null);

    const { createMessage } = useContext(MessageContext);

    const handleContinue = () => {
        if (files == null || files[0] == null) {
            createMessage(MessageType.ERROR, "Ohne PDF Datei kann nicht fortgefahren werden")
            return
        }

        onNext(files[0])
    }

    return (
        <>
            <img
                className="close-icon"
                src={CloseIcon}
                alt="Close Icon"
                onClick={onClose}
            />
            <h2>Anleitung hinzufügen</h2>
            <span>1. PDF hochladen:</span>
            <input
                className="file-input"
                type="file"
                onChange={
                    (e: React.ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)
                }
                accept=".pdf"
            />
            <button onClick={handleContinue}>Weiter</button>
        </>
    )
}

function ManualRelationPopup({ onNext, onClose }: { onNext: (itemSerialNumber: string, itemName: string) => void; onClose: () => void; }) {
    const [ itemSerialNumber, setItemSerialNumber ] = useState("")
    const [ receivedItem, setReceivedItem ] = useState<ExtendedItem | null>(null);

    const { makeRequest } = useContext(RequestContext);
    const { createMessage } = useContext(MessageContext);

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const handleFirstContinue = async () => {
        try {
            validateSerialNumberFormat(itemSerialNumber)
        } catch (e) {
            createMessage(MessageType.ERROR, "Validierung der Seriennummer fehlgeschlagen: " + getErrorMessage(e))
            return
        }

        let receivedItem: ExtendedItem;
        try {
            receivedItem = await makeRequest<ExtendedItem>(`/api/items/${itemSerialNumber}`)
        } catch (e) {
            createMessage(MessageType.ERROR, "Fehler beim Anfragen des Items: " + getErrorMessage(e))
            return
        }

        setReceivedItem(receivedItem)
    }

    return (
        <>
            <img
                className="close-icon"
                src={CloseIcon}
                alt="Close Icon"
                onClick={onClose}
            />
            <h2>Anleitung hinzufügen</h2>
            <span>2. Item zuordnen:</span>
            <AutosizeInput
                value={itemSerialNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemSerialNumber(e.target.value)}
                placeholder="Item SN"
                disabled={receivedItem !== null}
            />
            {receivedItem === null && <button onClick={handleFirstContinue}>Weiter</button>}
            {receivedItem !== null &&
            <>
                <span>3. Zuordnung bestätigen:</span>
                <ul className="item-props">
                    <li>Name: {receivedItem.item.name}</li>
                    <li>Kategorie: {receivedItem.subcategory.name}</li>
                </ul>
                <button onClick={() => onNext(itemSerialNumber, receivedItem.item.name)}>Fertig</button>
            </>}
            
        </>
    )
}

function Manuals() {
    const [ manuals, setManuals ] = useState<Manual[]>([]);
    const [ search, setSearch ] = useState("");
    const [ viewManualUUID, setViewManualUUID ] = useState<string | null>(null);
    
    const { makeRequest } = useContext(RequestContext);
    const { createMessage } = useContext(MessageContext);
    const { showPopup, closePopup } = useContext(PopupContext);

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const getManuals= async () => {
        let manualsResponse: Manual[];
        try {
            manualsResponse = await makeRequest<Manual[]>("/api/manuals")
            setManuals(manualsResponse)
        } catch (e) {
            createMessage(MessageType.ERROR, "Fehler beim Abrufen der Anleitungen: " + getErrorMessage(e))
        }
    }

    useEffect(() => {
        getManuals()
    }, [])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleManualCreation = () => {
        const postManual = async (file: File, itemSerialNumber: string, itemName: string) => {
            const formData = new FormData()
            const newManualUUID = uuid()

            formData.append("manual_file", file)
            formData.append("manual_uuid", newManualUUID)
            formData.append("item_sn", itemSerialNumber)
                   
            try {
                await makeRequest<null>("/api/manuals", {
                    method: "POST",
                    body: formData
                })
            } catch (e) {
                createMessage(MessageType.ERROR, "Erstellung der Anleitung fehlgeschlagen: " + getErrorMessage(e))
                return
            }

            setManuals(currManuals => [...currManuals, { uuid: newManualUUID, item_serial_number: itemSerialNumber, item_name: itemName }])

            closePopup()
        } 

        showPopup(
            <ManualUploadPopup
                onNext={
                    (file: File) => {
                        showPopup(
                            <ManualRelationPopup
                                onNext={(itemSerialNumber: string, itemName: string) => postManual(file, itemSerialNumber, itemName)}
                                onClose={closePopup}
                            />
                        )
                    } 
                }
                onClose={closePopup}
            />
        )
    }

    return (
        <>
            <h2>Anleitungen und Ressourcen</h2>
            <div className="search-box">
                <div>
                    <img
                        src={SearchIcon}

                    />
                    <input
                        placeholder="Itemname oder Seriennummer"
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
                <button onClick={handleManualCreation} >
                    <img src={NoteAddIcon} />
                    Anleitung hinzufügen
                </button>
            </div>
            <div className="manuals">
                {
                    manuals.map(el => {
                        return (
                            <div
                                key={el.uuid}
                                onClick={() => setViewManualUUID(el.uuid)}
                            >
                                <section className="manual-info">
                                    <span className="item-name">{el.item_name}</span>
                                    <span className="item-sn">{el.item_serial_number}</span>
                                </section>
                                <section className="manual-view">
                                    <img alt="Eye Icon" src={EyeIcon} />
                                </section>
                            </div>
                        )
                    })
                }
            </div>
            {viewManualUUID !== null &&
                <div className="manual-modal">
                    <iframe
                        src={`/files/${viewManualUUID}.pdf`}
                        height="100%"
                        width="100%"
                    />
                </div>
            }
        </>
    )
}

export default Manuals