import { intersection, type, literal, TypeOf } from 'io-ts';
import { createLocation, LocationValidator } from '../../../repo/locations/location-type';
import { EditLocationCommand } from './edit-location-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';

export const EDIT_LOCATION = 'LocationEdited';

export const LocationEditedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(EDIT_LOCATION),
        version: literal(1),
        data: LocationValidator
    })
]);

export type LocationEditedV1 = TypeOf<typeof LocationEditedValidatorV1>;

export function createEditLocationEvent(command: EditLocationCommand): LocationEditedV1 {
    const event = {
        ...createBaseEvent(command, command.locationId, EDIT_LOCATION, 1),
        data: createLocation(command)
    };

    return validateType(event, LocationEditedValidatorV1);
}