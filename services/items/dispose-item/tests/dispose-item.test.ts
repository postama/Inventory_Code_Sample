import uuid from 'uuid/v4';
import { createTestItem } from '../../../../repo/items/test/test-util';
import { createTestDisposeCommand, createTestDisposeEvent } from './test.util';
import { disposeItemReducer } from '../dispose-item-reducer';
import { getById, save } from '../../../../repo/items/item';
import { save as saveLocation } from '../../../../repo/locations/location';
import { createDisposeCommand } from '../dispose-item-command';
import { createDisposeEvent } from '../dispose-item-event';
import { createTestAdjustEvent } from '../../adjust-qty/tests/test.util';
import { createDisposal, entry } from '../dispose-item';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { createTestCreateLocationEvent } from '../../../locations/create-location/tests/test.util';
import { ItemQtyAdjustedV1 } from '../../adjust-qty/adjust-qty-event';
import { ItemCreatedV1 } from '../../create-item/create-item-event';
import { LocationCreatedV1 } from '../../../locations/create-location/create-location-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('dispose item', () => {
    describe('command creator/validator', () => {
        test('should fail without commandId', () => {
            const command = createTestDisposeCommand({ customerId: undefined });
            expect.assertions(2);
            try {
                createDisposeCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at customerId but instead got: undefined.');
            }
        });

        test('should pass with proper structure', () => {
            const command = createTestDisposeCommand();
            const validCommand = createDisposeCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('event creator', () => {
        test('should fail if given a bad commmand', () => {
            try {
                expect.assertions(2);
                const command = createTestDisposeCommand({ quantity: 'abc' });
                createDisposeEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toContain('Expecting Int at quantity but instead got: \"abc\".');
            }
        });

        test('should create event if given a valid command', () => {
            const command = createTestDisposeCommand();
            const event = createDisposeEvent(command);
            expect(event.type).toBe('ItemDisposed');
        });
    });

    describe('create event - integration', () => {
        test('should successfully alter the amount', async () => {
            // Arrange
            const location: LocationCreatedV1 = createTestCreateLocationEvent();
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await Promise.all([saveLocation(location), save(event)]);
            const locationId = location.entityId;
            const itemId = event.entityId;
            const customerId = event.customerId;
            const adjust: ItemQtyAdjustedV1 = createTestAdjustEvent({ customerId, itemId, locationId, quantity: 3 });
            await save(adjust);
            const disposalCommand = createTestDisposeCommand({ customerId, itemId, locationId, quantity: 1 });

            // Execute
            await createDisposal(disposalCommand, event.entityId);

            // Assert
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(2);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestDisposeCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('reducer', () => {
        test('should fail if no item is provided', async () => {
            const event = createTestDisposeEvent();
            expect.assertions(1);
            try {
                disposeItemReducer({} as any, event);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });

        test('should fail if the dispose will make the quantity negative', async () => {
            const item = createTestItem();
            const event = createTestDisposeEvent({ quantity: 2 }, {});
            expect.assertions(1);
            try {
                disposeItemReducer(item, event);
            } catch (e) {
                expect(e.message).toBe(`Cannot reduce quantity below 0 at location ${event.data.locationId}`);
            }
        });
    });
});