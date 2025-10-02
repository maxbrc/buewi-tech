interface Location {
    id: number;
    name: string;
    building_name: string;
    room: string;
}

type LocationsResponse = {
    [key: string]: Location;
}

export { Location, LocationsResponse }