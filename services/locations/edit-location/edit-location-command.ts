import { intersection, type, literal, TypeOf } from 'io-ts';
import { BaseLocationCommand } from '../shared/base-location-command';
import { validateType } from '../../../infrastructure/validator/validator';

export const EditLocationCommandValidator = intersection([
    BaseLocationCommand,
    type({ type: literal('EditLocation') })
]);

export type EditLocationCommand = TypeOf<typeof EditLocationCommandValidator>;

export function createEditLocationCommand(request: any, locationId: string): EditLocationCommand {
    return validateType({ ...request, type: 'EditLocation', locationId }, EditLocationCommandValidator);
}