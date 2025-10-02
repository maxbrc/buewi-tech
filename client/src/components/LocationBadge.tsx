import { Location } from "../types/locations";

import LocationIcon from "../assets/location.svg";

import "../styles/location_badge.css"

function LocationBadge({ location, showDetail, showIcon }: { location: Location; showDetail: boolean; showIcon: boolean; }) {
    return (
        <div className="item-location">
            {showIcon && <img src={LocationIcon} />}
            {location.name}
            {showDetail && ` - ${location.room}`}
        </div>
    )
}

export default LocationBadge