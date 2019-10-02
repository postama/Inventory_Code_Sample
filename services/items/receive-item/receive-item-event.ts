import { ItemActionEventValidator } from '../../../repo/items/base-item-event';
import { literal, type, TypeOf, intersection } from 'io-ts';
import { ReceiveItemCommand } from './receive-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';

export const RECEIVE_ITEM = 'ItemReceived';

export const ItemReceivedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(RECEIVE_ITEM),
        version: literal(1),
        data: ItemActionEventValidator
    })
]);

export type ItemReceivedV1 = TypeOf<typeof ItemReceivedValidatorV1>;

export function createReceiveEvent(command: ReceiveItemCommand): ItemReceivedV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, RECEIVE_ITEM, 1),
        data: {
            locationId: command.locationId,
            quantity: command.quantity,
            description: command.description
        }
    };
    return validateType(event, ItemReceivedValidatorV1);
}