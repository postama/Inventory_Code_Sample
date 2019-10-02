import uuid from 'uuid/v4';
import { createTestTransferCommand, createTestTransferItemEvent } from './test.util';
import { createTransferCommand } from '../transfer-item-command';
import { createTransferEvent } from '../transfer-item-event';
import { transferItemReducer } from '../transfer-item-reducer';
import { createTestItem } from '../../../../repo/items/test/test-util';
import { createTestCreateLocationEvent } from '../../../locations/create-location/tests/test.util';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { save, getById } from '../../../../repo/items/item';
import { save as saveLocation } from '../../../../repo/locations/location';
import { createTestAdjustEvent } from '../../adjust-qty/tests/test.util';
import { createTransfer, entry } from '../transfer-item';
import { LocationCreatedV1 } from '../../../locations/create-location/create-location-event';
import { ItemCreatedV1 } from '../../create-item/create-item-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('transfer inventory item', () => {
    describe('create command', () => {
        test('should fail without commandId with a human readable error message', () => {
            const command = createTestTransferCommand({ customerId: undefined });
            expect.assertions(2);
            try {
                createTransferCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at customerId but instead got: undefined.');
            }
        });

        test('should create a command if provided proper structure', () => {
            const command = createTestTransferCommand();
            const validCommand = createTransferCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('create event', () => {
        test('should fail if given a bad command', () => {
            expect.assertions(2);
            try {
                const command = createTestTransferCommand({ quantity: 'abc' });
                createTransferEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toContain('Expecting Int at quantity but instead got: \"abc\".');
            }
        });

        test('should create event if given a valid command', () => {
            const command = createTestTransferCommand();
            const event = createTransferEvent(command);
            expect(event.type).toBe('ItemTransferred');
        });
    });

    describe('reducer', () => {
        test('should fail if no item is provided', async () => {
            const event = createTestTransferItemEvent();
            expect.assertions(1);
            try {
                transferItemReducer({} as any, event);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });

        test('should fail if the transferred from quantity goes negative', async () => {
            const item = createTestItem();
            const event = createTestTransferItemEvent({ quantity: 2 });
            try {
                transferItemReducer(item, event);
            } catch (e) {
                expect(e.message).toBe(`Cannot transfer quantity below 0 at location ${event.data.locationId}`);
            }
        });

        test('should successfully transfer items', async () => {
            const item = createTestItem();
            const locationFromId = uuid();
            const locationToId = uuid();
            item.locations = {
                [locationFromId]: 5,
                [locationToId]: 2
            };

            const event = createTestTransferItemEvent({ quantity: 2, locationId: locationFromId, transferTo: locationToId });
            const newItem = transferItemReducer(item, event);
            expect(newItem.locations[locationFromId]).toBe(3);
            expect(newItem.locations[locationToId]).toBe(4);
        });
    });

    describe('create event - integration', () => {
        test('should successfully alter the amounts', async () => {
            const locationTo: LocationCreatedV1 = createTestCreateLocationEvent();
            const locationFrom: LocationCreatedV1 = createTestCreateLocationEvent();
            const item: ItemCreatedV1 = createTestCreateItemEvent();
            await Promise.all([saveLocation(locationTo), saveLocation(locationFrom), save(item)]);
            const adjust = createTestAdjustEvent({ customerId: item.customerId, itemId: item.entityId, locationId: locationFrom.entityId, quantity: 3 });
            await save(adjust);
            const transferCommand = createTestTransferCommand({ itemId: item.entityId, customerId: item.customerId, quantity: 1, locationId: locationFrom.entityId, transferTo: locationTo.entityId });
            await createTransfer(transferCommand, item.entityId);
            const finalItem = await getById(item.customerId, item.entityId);
            expect(finalItem.locations[locationTo.entityId]).toBe(1);
            expect(finalItem.locations[locationFrom.entityId]).toBe(2);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestTransferCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });
});