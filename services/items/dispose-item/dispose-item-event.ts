import { type, literal, TypeOf, intersection } from 'io-ts';
import { DisposeItemCommand } from './dispose-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';
import { ItemActionEventValidator } from '../../../repo/items/base-item-event';

export const DISPOSE_ITEM = 'ItemDisposed';

export const ItemDisposedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(DISPOSE_ITEM),
        version: literal(1),
        data: ItemActionEventValidator
    })
]);

export type ItemDisposedV1 = TypeOf<typeof ItemDisposedValidatorV1>;

export function createDisposeEvent(command: DisposeItemCommand): ItemDisposedV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, DISPOSE_ITEM, 1),
        data: {
            quantity: command.quantity,
            locationId: command.locationId,
            description: command.description
        }
    };

    return validateType(event, ItemDisposedValidatorV1);
}