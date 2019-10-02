import { string, type as iotype, TypeOf, UnknownRecord, number } from 'io-ts';
import { validateType } from '../../infrastructure/validator/validator';
import { stringMatch } from '../../infrastructure/custom-brands/string-length';
import { UUID } from 'io-ts-types/lib/UUID'
import uuid from 'uuid/v4';

// These are the 'columns' of our dynamo db
export const BaseEventValidator = iotype({
    type: string,
    id: UUID,
    // The api gateway command id to ensure command is not processed twice
    commandId: string,
    version: number,
    customerId: stringMatch(6, 6),
    siteId: stringMatch(6, 6),
    user: string,
    created: string,
    entityId: UUID,
    genEntityIdTime: string,
    genEntityIdEventTypeTime: string,
    data: UnknownRecord,
    state: UnknownRecord
});

export type BaseEvent = TypeOf<typeof BaseEventValidator>;

export function createBaseEvent(
    { customerId, siteId, user, commandId },
    entityId: string,
    type: string,
    version: number): BaseEvent {
    const created = new Date();
    return validateType({
        type,
        id: uuid(),
        commandId,
        version,
        customerId,
        siteId,
        user,
        created: created.toISOString(),
        entityId,
        genEntityIdTime: `${entityId}-${created.getTime()}`,
        genEntityIdEventTypeTime: `${entityId}-${type}-${created.getTime()}`,
        data: {},
        state: {}
    }, BaseEventValidator);
}
