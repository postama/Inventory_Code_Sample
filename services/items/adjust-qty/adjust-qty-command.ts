import { literal, type, TypeOf, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseQtyCommand } from '../shared/base-command-types';

export const ItemAdjustmentValidator = intersection([
    BaseQtyCommand,
    type({ type: literal('AdjustItemQty') })
]);

export type AdjustItemQtyCommand = TypeOf<typeof ItemAdjustmentValidator>;

export function createAdjustCommand(request: any, itemId: string): AdjustItemQtyCommand {
    return validateType({ ...request, itemId, type: 'AdjustItemQty' }, ItemAdjustmentValidator);
}