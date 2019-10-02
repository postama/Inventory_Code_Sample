import { type, TypeOf, literal, intersection } from 'io-ts';
import { ItemActionEventValidator } from '../../../repo/items/base-item-event';
import { AdjustItemQtyCommand } from './adjust-qty-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { createBaseEvent, BaseEventValidator } from '../../../repo/events/event-type';

export const ADJUST_ITEM = 'ItemQtyAdjusted';

export const ItemQtyAdjustedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(ADJUST_ITEM),
        version: literal(1),
        data: ItemActionEventValidator
    })
]);

export type ItemQtyAdjustedV1 = TypeOf<typeof ItemQtyAdjustedValidatorV1>;

export function createAdjustQtyEvent(command: AdjustItemQtyCommand): ItemQtyAdjustedV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, ADJUST_ITEM, 1),
        data: {
            locationId: command.locationId,
            quantity: command.quantity,
            description: command.description
        }
    };

    return validateType(event, ItemQtyAdjustedValidatorV1);
}