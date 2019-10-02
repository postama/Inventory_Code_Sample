import { LocationCreatedV1 } from '../../services/locations/create-location/create-location-event';
import { LocationEditedV1 } from '../../services/locations/edit-location/edit-location-event';

export type LocationEvent =
    LocationCreatedV1 |
    LocationEditedV1;