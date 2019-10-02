import { intersection, literal, type, TypeOf } from 'io-ts';
import { UUID } from 'io-ts-types/lib/UUID'
import { TransferItemCommand } from './transfer-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseEventValidator, createBaseEvent } from '../../../repo/events/event-type';
import { ItemActionEventValidator } from '../../../repo/items/base-item-event';

export const TRANSFER_ITEM = 'ItemTransferred';

export const ItemTransferredValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(TRANSFER_ITEM),
        version: literal(1),
        data: intersection([
            ItemActionEventValidator,
            type({transferredTo: UUID})
        ])
    })
]);

export type ItemTransferredV1 = TypeOf<typeof ItemTransferredValidatorV1>;

export function createTransferEvent(command: TransferItemCommand): ItemTransferredV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, TRANSFER_ITEM, 1),
        data: {
            quantity: command.quantity,
            locationId: command.locationId,
            transferredTo: command.transferTo,
            description: command.description
        }
    };
    return validateType(event, ItemTransferredValidatorV1);
}