import { type, literal, TypeOf, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseQtyCommand } from '../shared/base-command-types';

export const ReceiveItemValidator = intersection([
    BaseQtyCommand,
    type({type: literal('ReceiveItem')})
]);

export type ReceiveItemCommand = TypeOf<typeof ReceiveItemValidator>;

export function createReceiveCommand(request: any, itemId: string): ReceiveItemCommand {
    return validateType({...request, itemId, type: 'ReceiveItem'}, ReceiveItemValidator);
}
