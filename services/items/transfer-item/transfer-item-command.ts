import { intersection, type, literal, TypeOf } from 'io-ts';
import { BaseQtyCommand } from '../shared/base-command-types';
import { UUID } from 'io-ts-types/lib/UUID'
import { validateType } from '../../../infrastructure/validator/validator';

export const TransferItemValidator = intersection([
    BaseQtyCommand,
    type({ type: literal('TransferItem'), transferTo: UUID })
]);

export type TransferItemCommand = TypeOf<typeof TransferItemValidator>;

export function createTransferCommand(request: any, itemId: string): TransferItemCommand {
    return validateType({ ...request, itemId, type: 'TransferItem' }, TransferItemValidator);
}