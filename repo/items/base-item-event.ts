import { UUID } from 'io-ts-types/lib/UUID'
import { intersection, type as iotype, Int, partial } from 'io-ts';
import { maxLength } from '../../infrastructure/custom-brands/string-length';

export const ItemActionEventValidator = intersection([
    iotype({
        locationId: UUID,
        quantity: Int
    }),
    partial({
        description: maxLength(200)
    })
]);
