import { type, TypeOf, literal, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import uuid from 'uuid/v4';
import { ItemDataValidator } from '../../../repo/items/item.type';
import { BaseItemCommand } from '../shared/base-command-types';

export const CreateItemCommandValidator = intersection([
    BaseItemCommand,
    type({ type: literal('CreateItem') }),
    ItemDataValidator
]);

export type CreateItemCommand = TypeOf<typeof CreateItemCommandValidator>;

export function createCreateItemCommand(request: any): CreateItemCommand {
    return validateType({ ...request, type: 'CreateItem', itemId: uuid() }, CreateItemCommandValidator);
}