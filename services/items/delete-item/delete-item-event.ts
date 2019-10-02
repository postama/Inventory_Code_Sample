import { type, literal, TypeOf, intersection } from 'io-ts';
import { DeleteItemCommand } from './delete-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';

export const DELETE_ITEM = 'ItemDeleted';

export const ItemDeletedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(DELETE_ITEM),
        version: literal(1)
    })
]);

export type ItemDeletedV1 = TypeOf<typeof ItemDeletedValidatorV1>;

export function createDeleteItemEvent(command: DeleteItemCommand): ItemDeletedV1 {
    const event = createBaseEvent(command, command.itemId, DELETE_ITEM, 1);
    return validateType(event, ItemDeletedValidatorV1);
}