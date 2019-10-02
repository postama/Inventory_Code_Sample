import { type, literal, TypeOf, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseQtyCommand } from '../shared/base-command-types';

export const DisposeItemValidator = intersection([
    BaseQtyCommand,
    type({ type: literal('DisposeItem') })
]);

export type DisposeItemCommand = TypeOf<typeof DisposeItemValidator>;

export function createDisposeCommand(request: any, itemId: string): DisposeItemCommand {
    return validateType({ ...request, itemId, type: 'DisposeItem' }, DisposeItemValidator);
}