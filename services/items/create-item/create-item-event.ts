import { type, literal, TypeOf, intersection } from 'io-ts';
import { CreateItemCommand } from './create-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { ItemDataValidator, createItemData } from '../../../repo/items/item.type';
import { BaseEventValidator, createBaseEvent } from '../../../repo/events/event-type';
import uuid from 'uuid/v4';

export const CREATE_ITEM = 'ItemCreated';

export const ItemCreatedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(CREATE_ITEM),
        version: literal(1),
        data: ItemDataValidator
    })
]);

export type ItemCreatedV1 = TypeOf<typeof ItemCreatedValidatorV1>;

export function createCreateItemEvent(command: CreateItemCommand): ItemCreatedV1 {
    const event = {
        ...createBaseEvent(command, uuid(), CREATE_ITEM, 1),
        data: createItemData(command)
    };

    return validateType(event, ItemCreatedValidatorV1);
}