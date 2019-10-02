import { type, TypeOf, literal, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseItemCommand } from '../shared/base-command-types';

export const DeleteItemCommandValidator = intersection([
    BaseItemCommand,
    type({ type: literal('DeleteItem')})
]);

export type DeleteItemCommand = TypeOf<typeof DeleteItemCommandValidator>;

export function createDeleteItemCommand(request: any, itemId: string): DeleteItemCommand {
    return validateType({ ...request, itemId, type: 'DeleteItem' }, DeleteItemCommandValidator);
}