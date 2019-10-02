import uuid from 'uuid/v4';
import { createAdjustment, entry } from '../adjust-qty';
import { getById, save } from '../../../../repo/items/item';
import { save as saveLocation } from '../../../../repo/locations/location';
import { adjustQtyReducer } from '../adjust-qty-reducer';
import { createTestAdjustCommand, createTestAdjustEvent } from './test.util';
import { createTestItem } from '../../../../repo/items/test/test-util';
import { createAdjustCommand } from '../adjust-qty-command';
import { createAdjustQtyEvent } from '../adjust-qty-event';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { createTestCreateLocationEvent } from '../../../locations/create-location/tests/test.util';
import { LocationCreatedV1 } from '../../../locations/create-location/create-location-event';
import { ItemCreatedV1 } from '../../create-item/create-item-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('adjust inventory qty', () => {
    describe('command creator/validator', () => {
        test('should pass with proper structure', () => {
            const command = createTestAdjustCommand();
            const validCommand = createAdjustCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('event creator', () => {
        test('should fail if given a bad command', () => {
            try {
                expect.assertions(2);
                const command = createTestAdjustCommand({ quantity: 'abc', locationId: uuid() });
                createAdjustQtyEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toContain('Expecting Int at quantity but instead got: \"abc\".');
            }
        });

        test('should create an event if given a valid command', () => {
            const command = createTestAdjustCommand();
            const event = createAdjustQtyEvent(command);
            expect(event.type).toBe('ItemQtyAdjusted');
        });
    });

    describe('create event - integration', () => {
        test('should successfully alter the amount (1 event)', async () => {
            const location: LocationCreatedV1 = createTestCreateLocationEvent();
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await Promise.all([saveLocation(location), save(event)]);
            const command = createTestAdjustCommand({ customerId: event.customerId, quantity: 2, locationId: location.entityId });
            await createAdjustment(command, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(2);
        });

        test('should successfully alter the amount (2 events)', async () => {
            const location1: LocationCreatedV1 = createTestCreateLocationEvent();
            const location2: LocationCreatedV1 = createTestCreateLocationEvent();
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await Promise.all([saveLocation(location1), save(event), saveLocation(location2)]);
            const command = createTestAdjustCommand({ customerId: event.customerId, quantity: 2, locationId: location1.entityId });
            await createAdjustment(command, event.entityId);
            const commandTwo = createTestAdjustCommand({ customerId: event.customerId, quantity: 3, locationId: location2.entityId });
            await createAdjustment(commandTwo, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(5);
            expect(item.locations[command.locationId]).toBe(2);
        });
    });

    describe('reducer', () => {
        test('should fail if no item is provided (create needs to come before adjust)', async () => {
            const projectedEvent = createTestAdjustEvent();
            expect.assertions(1);
            try {
                adjustQtyReducer({} as any, projectedEvent);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });

        test('should fail if the adjustment will make the qty negative', async () => {
            const item = createTestItem();
            const projectedAdjust = createTestAdjustEvent({ quantity: -2 });
            expect.assertions(1);
            try {
                adjustQtyReducer(item, projectedAdjust);
            } catch (e) {
                expect(e.message).toBe(`Cannot adjust quantity below 0 at location ${projectedAdjust.data.locationId}`);
            }
        });

        test('should adjust the qty on the correct location', async () => {
            const item = createTestItem();
            const projectedAdjust = createTestAdjustEvent();
            const changedItem = adjustQtyReducer(item, projectedAdjust);
            expect(changedItem.locations[projectedAdjust.data.locationId]).toBe(1);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestAdjustCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });
});