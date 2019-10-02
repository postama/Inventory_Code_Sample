import { ItemReducer, getById, save } from '../item';
import uuid from 'uuid/v4';
import { Item } from '../item.type';
import { pagedReducer } from '../../../infrastructure/persistence/dynamo';
import { ItemEvent } from '../item-event-types';
import { getEntityQuery } from '../../events/entity';
import { createTestCreateItemEvent } from '../../../services/items/create-item/tests/test.util';
import { createTestAdjustEvent } from '../../../services/items/adjust-qty/tests/test.util';
import { ItemCreatedV1 } from '../../../services/items/create-item/create-item-event';
import { ItemQtyAdjustedV1 } from '../../../services/items/adjust-qty/adjust-qty-event';

describe('inventory aggregate root', () => {
    describe('event reducer', () => {
        test('should reduce events to an inventory item', async () => {
            const event1: ItemCreatedV1 = createTestCreateItemEvent();
            const event2: ItemQtyAdjustedV1 = createTestAdjustEvent({ customerId: event1.customerId, itemId: event1.entityId }, {});
            const event3: ItemQtyAdjustedV1 = createTestAdjustEvent({ customerId: event1.customerId, itemId: event1.entityId }, {});
            const item = ItemReducer.reduce({}, [event1, event2, event3]);
            expect(item.quantity).toBe(2);
            expect(item.created).toBe(event1.created);
        });

        test('should throw if create does not come first', async () => {
            try {
                const itemId = uuid();
                const event1: ItemQtyAdjustedV1 = createTestAdjustEvent({ itemId }, {});
                const event2: ItemCreatedV1 = createTestCreateItemEvent({ customerId: event1.customerId }, { itemId });
                ItemReducer.reduce({}, [event1, event2]);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });

        test('should work across multiple pages of events', async () => {
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await save(event);
            const adjust1: ItemQtyAdjustedV1 = createTestAdjustEvent({ customerId: event.customerId, itemId: event.entityId });
            const adjust2: ItemQtyAdjustedV1 = createTestAdjustEvent({ customerId: event.customerId, itemId: event.entityId });
            await Promise.all([save(adjust1), save(adjust2)]);

            const query = getEntityQuery(event.customerId, event.entityId);
            const result = await pagedReducer<Item, ItemEvent>(ItemReducer, query, undefined, { Limit: 1 });
            expect(result.quantity).toBe(2);
        });

        test('should return null if no events', async () => {
            const result = await pagedReducer(ItemReducer, getEntityQuery(uuid(), uuid()), undefined, { Limit: 1 });
            expect(result).toBeNull();
        });
    });

    describe('getById', () => {
        test('should get an inventory item', async () => {
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await save(event);
            const item = await getById(event.customerId, event.entityId);
            expect(item).toMatchSnapshot({
                created: expect.any(String)
            });
        });
    });
});