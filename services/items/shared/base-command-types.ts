import { intersection, type, Int, partial } from 'io-ts';
import { UUID } from 'io-ts-types/lib/UUID'
import { BaseCommand } from '../../shared/base-command';
import { maxLength } from '../../../infrastructure/custom-brands/string-length';

export const BaseItemCommand = intersection([
    BaseCommand,
    type({ itemId: UUID })
]);

export const BaseQtyCommand = intersection([
    BaseItemCommand,
    type({ quantity: Int, locationId: UUID }),
    partial({ description: maxLength(200) })
]);
