import { type, TypeOf, literal, intersection } from 'io-ts';
import { IssueItemCommand } from './issue-item-command';
import { validateType } from '../../../infrastructure/validator/validator';
import { maxLength } from '../../../infrastructure/custom-brands/string-length';
import { BaseEventValidator, createBaseEvent } from '../../../repo/events/event-type';
import { ItemActionEventValidator } from '../../../repo/items/base-item-event';

export const ITEM_ISSUED = 'ItemIssued';

export const ItemIssuedValidatorV1 = intersection([
    BaseEventValidator,
    type({
        type: literal(ITEM_ISSUED),
        version: literal(1),
        data: intersection([
            ItemActionEventValidator,
            type({ issuedTo: maxLength(100) })
        ])
    })
]);

export type ItemIssuedV1 = TypeOf<typeof ItemIssuedValidatorV1>;

export function createIssueItemEvent(command: IssueItemCommand): ItemIssuedV1 {
    const event = {
        ...createBaseEvent(command, command.itemId, ITEM_ISSUED, 1),
        data: {
            locationId: command.locationId,
            quantity: command.quantity,
            description: command.description,
            issuedTo: command.issuedTo
        }
    };

    return validateType(event, ItemIssuedValidatorV1);
}