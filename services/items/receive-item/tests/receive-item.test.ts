import uuid from 'uuid/v4';
import { createTestReceiveCommand, createTestReceiveEvent } from './test.util';
import { createReceiveCommand } from '../receive-item-command';
import { createReceiveEvent } from '../receive-item-event';
import { getById, save } from '../../../../repo/items/item';
import { save as saveLocation } from '../../../../repo/locations/location';
import { createTestAdjustEvent } from '../../adjust-qty/tests/test.util';
import { createReceive, entry } from '../receive-item';
import { receiveItemReducer } from '../receive-item-reducer';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { createTestCreateLocationEvent } from '../../../locations/create-location/tests/test.util';
import { createTestItem } from '../../../../repo/items/test/test-util';
import { LocationCreatedV1 } from '../../../locations/create-location/create-location-event';
import { ItemCreatedV1 } from '../../create-item/create-item-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('receive inventory item', () => {
    describe('create command', () => {
        test('should fail without commandId with a human readable error message', () => {
            const command = createTestReceiveCommand({ customerId: undefined });
            expect.assertions(2);
            try {
                createReceiveCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at customerId but instead got: undefined.');
            }
        });

        test('should create a command if provided proper structure', () => {
            const command = createTestReceiveCommand();
            const validCommand = createReceiveCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('create event', () => {
        test('should fail if given a bad command', () => {
            expect.assertions(2);
            try {
                const command = createTestReceiveCommand({ quantity: 'abc' });
                createReceiveEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toContain('Expecting Int at quantity but instead got: \"abc\".');
            }
        });

        test('should create event if given a valid command', () => {
            const command = createTestReceiveCommand();
            const event = createReceiveEvent(command);
            expect(event.type).toBe('ItemReceived');
        });
    });

    describe('create event - integration', () => {
        test('should successfully alter the amount', async () => {
            const location: LocationCreatedV1 = createTestCreateLocationEvent();
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            await Promise.all([saveLocation(location), save(event)]);
            const adjust = createTestAdjustEvent({ customerId: event.customerId, itemId: event.entityId, locationId: location.entityId, quantity: 3 });
            await save(adjust);
            const receiveCommand = createTestReceiveCommand({ customerId: event.customerId, quantity: 1, locationId: location.entityId });
            await createReceive(receiveCommand, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(4);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestReceiveCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('reducer', () => {
        test('should fail if no item is provided', async () => {
            const event = createTestReceiveEvent();
            expect.assertions(1);
            try {
                receiveItemReducer({} as any, event);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });

        test('should add the location if it doesn\'t exist', async () => {
            const event = createTestReceiveEvent();
            const item = createTestItem();
            const newItem = receiveItemReducer(item, event);
            expect(Object.keys(newItem.locations)).toHaveLength(1);
        });
    });
});