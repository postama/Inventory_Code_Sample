import { type, TypeOf, intersection, literal } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { ItemDataValidator } from '../../../repo/items/item.type';
import { BaseItemCommand } from '../shared/base-command-types';

export const EditItemCommandValidator = intersection([
    BaseItemCommand,
    type({ type: literal('EditItem') }),
    ItemDataValidator
]);

export type EditItemCommand = TypeOf<typeof EditItemCommandValidator>;

export function createEditItemCommand(request: any, itemId: string): EditItemCommand {
    return validateType({ ...request, itemId, type: 'EditItem' }, EditItemCommandValidator);
}