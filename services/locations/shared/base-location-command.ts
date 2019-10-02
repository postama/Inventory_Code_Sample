import { intersection, type, boolean, partial } from 'io-ts';
import { UUID } from 'io-ts-types/lib/UUID'
import { maxLength } from '../../../infrastructure/custom-brands/string-length';
import { BaseCommand } from '../../shared/base-command';

export const BaseLocationCommand = intersection([
    BaseCommand,
    type({
        locationId: UUID,
        name: maxLength(50),
        isActive: boolean
    }),
    partial({
        description: maxLength(100)
    })
]);