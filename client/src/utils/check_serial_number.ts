import { Subcategory } from "../types/inventory";

function validateSerialNumber(serialNumber: string, subcategory_id: number) {
    try {
        validateSerialNumberTechnicals(serialNumber)
    } catch (e) {
        throw e
    }

    if (serialNumber.slice(0, 2) !== subcategory_id.toString()) {
        throw new Error("Subkategorie-ID der Seriennummer muss mit der tatsächlichen Subkategorie übereinstimmen")
    }
}

function validateSerialNumberTechnicals(serialNumber: string) {
    if (serialNumber.length !== 6) {
        throw new Error("Seriennummer muss 6 Zeichen lang sein")
    }

    if (isNaN(Number(serialNumber.slice(0, 2)))) {
        throw new Error("Subkategorie muss aus zwei Zahlen bestehen")
    }

    if (isNaN(Number(serialNumber.slice(3)))) {
        throw new Error("Laufender Teil der Seriennummer muss aus Zahlen bestehen")
    }

    if (serialNumber[2] !== "-") {
        throw new Error("Subkategorie-ID und Laufender Teil müssen mit einem - (Bindestrich) getrennt sein")
    }
}

export { validateSerialNumber, validateSerialNumberTechnicals }