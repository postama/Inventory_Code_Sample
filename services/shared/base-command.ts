import { UUID } from 'io-ts-types/lib/UUID'
import { type, string } from 'io-ts';

export const BaseCommand = type({
    commandId: UUID,
    customerId: string,
    user: string,
    siteId: string
});
