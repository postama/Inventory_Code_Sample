import { Location } from '../../../repo/locations/location-type';
import { LocationEditedV1 } from './edit-location-event';

export function editLocationReducer(location: Location, event: LocationEditedV1): Location {
    return {
        ...event.data,
        created: location.created
    };
}