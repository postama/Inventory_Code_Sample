import { literal, type, TypeOf, intersection } from 'io-ts';
import { EditItemCommand } from './edit-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { ItemDataValidator, createItemData } from '../../../repo/items/item.type';
import { BaseEventValidator, createBaseEvent } from '../../../repo/events/event-type';

export const EDIT_ITEM = 'ItemEdited';

export const ItemEditedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(EDIT_ITEM),
        version: literal(1),
        data: ItemDataValidator
    })
]);

export type ItemEditedV1 = TypeOf<typeof ItemEditedValidatorV1>;

export function createEditItemEvent(command: EditItemCommand): ItemEditedV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, EDIT_ITEM, 1),
        data: createItemData(command)
    };

    return validateType(event, ItemEditedValidatorV1);
}