import { intersection, type, literal, TypeOf } from 'io-ts';
import { createLocation, LocationValidator } from '../../../repo/locations/location-type';
import { CreateLocationCommand } from './create-location-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';
import uuid from 'uuid/v4';

export const CREATE_LOCATION = 'LocationCreated';

export const LocationCreatedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(CREATE_LOCATION),
        version: literal(1),
        data: LocationValidator
    })
]);

export type LocationCreatedV1 = TypeOf<typeof LocationCreatedValidatorV1>;

export function createCreateLocationEvent(command: CreateLocationCommand): LocationCreatedV1 {
    const event = {
        ...createBaseEvent(command, uuid(), CREATE_LOCATION, 1),
        data: createLocation(command)
    };

    return validateType(event, LocationCreatedValidatorV1);
}