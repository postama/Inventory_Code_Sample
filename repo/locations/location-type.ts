import { intersection, type, string, partial, TypeOf, boolean } from 'io-ts';
import { validateType } from '../../infrastructure/validator/validator';

export const LocationValidator = intersection([
    type({
        name: string,
        isActive: boolean,
        siteId: string
    }),
    partial({
        description: string,
        created: string
    })
]);

export function createLocation(command): Location {
    return validateType(command, LocationValidator);
}

export type Location = TypeOf<typeof LocationValidator>;