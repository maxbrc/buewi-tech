import CheckCircleIcon from "../assets/check_circle.svg";
import BlockIcon from "../assets/block.svg";

function ConditionChip({ conditionID, condition, withIcon }: { conditionID: number, condition: { name: string; description: string; }; withIcon: boolean; }) {
    return (
        <div className="condition">
            {withIcon && <img src={(conditionID == 1 || conditionID == 2) ? CheckCircleIcon : BlockIcon} alt="zustandsbeschreibendes Icon"/>}
            <span className={"condition-" + conditionID}>{condition.name}</span>
        </div>
    )
}

export default ConditionChip