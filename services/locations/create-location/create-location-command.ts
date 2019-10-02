import { literal, intersection, type, TypeOf } from 'io-ts';
import { BaseLocationCommand } from '../shared/base-location-command';
import { validateType } from '../../../infrastructure/validator/validator';
import uuid from 'uuid/v4';

export const CreateLocationCommandValidator = intersection([
    BaseLocationCommand,
    type({ type: literal('CreateLocation') })
]);

export type CreateLocationCommand = TypeOf<typeof CreateLocationCommandValidator>;

export function createCreateLocationCommand(request: any): CreateLocationCommand {
    return validateType({ ...request, isActive: true, type: 'CreateLocation', locationId: uuid() }, CreateLocationCommandValidator);
}