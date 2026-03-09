import { memo, useEffect, useRef } from "react";

import ConditionChip from "./ConditionChip";
import BorrowingStatusChip from "./BorrowingStatusChip";
import LocationBadge from "./LocationBadge";

import VisibilityIcon from "../assets/visibility.svg";
import EditIcon from "../assets/edit.svg";
import { Icons } from "./Icons";
import "../styles/inventory.css";
import { EnrichedItem, ItemSelection } from "../types/inventory";

const InventoryItem = memo(function InventoryItem({ extendedItem, setSelectedItem, callbackFn }: { extendedItem: EnrichedItem, setSelectedItem: (itemSelection: ItemSelection | null) => void, callbackFn: () => void; }) {
    const borrowingEvent = extendedItem.borrowing_event

    return (
        <tr onClick={() => {
            setSelectedItem([extendedItem, false, false])
            callbackFn()
        }
        }>
            <td className="category">
                <img src={Icons[extendedItem.subcategory.icon as keyof typeof Icons]} />
                <span className="categories">{extendedItem.category.name} · {extendedItem.subcategory.name}</span>    
                <div className="spacer"></div>
                <BorrowingStatusChip borrowingEvent={borrowingEvent} />
            </td>
            <td className="name">{extendedItem.item.name}</td>
            <td className="serial-number">SN: {extendedItem.item.serial_number}</td>
            <td><ConditionChip conditionID={extendedItem.item.condition_id} condition={extendedItem.condition} withIcon={true} /></td>
            {extendedItem.item.condition_comment !== "__null__" && <td className="condition-comment">{extendedItem.item.condition_comment}</td>}
            <td>
                <LocationBadge location={extendedItem.location} showDetail={false} showIcon={true} />
                <section className="item-nav">
                    <img onClick={(e: React.MouseEvent) => {e.stopPropagation(); setSelectedItem([extendedItem, false, false])}} src={VisibilityIcon} />
                    <img onClick={(e: React.MouseEvent) => {e.stopPropagation(); setSelectedItem([extendedItem, true, false])}} src={EditIcon} />
                </section>
            </td>
        </tr>
    )
})

export default InventoryItem