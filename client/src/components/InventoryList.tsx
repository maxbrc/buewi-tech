import { memo } from "react";
import { EnrichedItem, ItemSelection } from "../types/inventory";
import InventoryItem from "./InventoryItem";

const InventoryList = memo(function InventoryList({ extendedItems, setSelectedItem, callbackFn }: { extendedItems: EnrichedItem[], setSelectedItem: (itemSelection: ItemSelection | null) => void; callbackFn: () => void; }) {
    return (
        <table>
            <tbody>
                {
                    extendedItems.map((extendedItem) => {
                        return <InventoryItem key={extendedItem.item.serial_number} extendedItem={extendedItem} setSelectedItem={setSelectedItem} callbackFn={callbackFn} />
                    })
                }
            </tbody>
        </table>
    )
})

export default InventoryList