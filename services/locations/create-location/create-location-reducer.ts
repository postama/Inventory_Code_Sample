import { Location } from '../../../repo/locations/location-type';
import { LocationCreatedV1 } from './create-location-event';

// tslint:disable-next-line variable-name
export function createLocationReducer(_location: Location, event: LocationCreatedV1): Location {
    return {
        ...event.data,
        siteId: event.siteId,
        created: event.created
    };
}