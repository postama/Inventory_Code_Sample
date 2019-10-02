import uuid from 'uuid/v4';
import { createIssue, entry } from '../issue-item';
import { getById, save } from '../../../../repo/items/item';
import { save as saveLocation } from '../../../../repo/locations/location';
import { createTestIssueCommand, createTestIssueItemEvent } from './test.util';
import { issueItemReducer } from '../issue-item-reducer';
import { createIssueItemEvent } from '../issue-item-event';
import { createIssueCommand } from '../issue-item-command';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { createTestCreateLocationEvent } from '../../../locations/create-location/tests/test.util';
import { LocationCreatedV1 } from '../../../locations/create-location/create-location-event';
import { ItemCreatedV1 } from '../../create-item/create-item-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('issue inventory item', () => {
    describe('create command', () => {
        test('should fail without commandId with a human readable error message', () => {
            const command = createTestIssueCommand({ customerId: undefined });
            expect.assertions(2);
            try {
                createIssueCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at customerId but instead got: undefined.');
            }
        });

        test('should pass with proper structure', () => {
            const command = createTestIssueCommand();
            const validCommand = createIssueCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('create event', () => {
        test('should fail if given a bad command', () => {
            expect.assertions(2);
            try {
                const command = createTestIssueCommand({ quantity: 'abc' });
                createIssueItemEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toContain('Expecting Int at quantity but instead got: \"abc\".');
            }
        });

        test('should create an event if given a valid command', () => {
            const command = createTestIssueCommand();
            const event = createIssueItemEvent(command);
            expect(event.type).toBe('ItemIssued');
        });

        test('should successfully alter the amount (1 event)', async () => {
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            const location: LocationCreatedV1 = createTestCreateLocationEvent();
            await Promise.all([saveLocation(location), save(event)]);
            const command = createTestIssueCommand({ customerId: event.customerId, quantity: 2, locationId: location.entityId });
            await createIssue(command, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(-2);
        });

        test('should successfully alter the amount (2 events)', async () => {
            const event: ItemCreatedV1 = createTestCreateItemEvent();
            const location: LocationCreatedV1 = createTestCreateLocationEvent();
            await Promise.all([saveLocation(location), save(event)]);
            const command = createTestIssueCommand({ customerId: event.customerId, quantity: 3, locationId: location.entityId });
            await createIssue(command, event.entityId);
            const commandTwo = createTestIssueCommand({ customerId: event.customerId, quantity: -2, locationId: location.entityId });
            await createIssue(commandTwo, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.quantity).toBe(-1);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestIssueCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('reducer tests', () => {
        test('should fail if no item is provided (create needs to come before adjust)', async () => {
            const event = createTestIssueItemEvent();
            expect.assertions(1);
            try {
                issueItemReducer({} as any, event);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });
    });
});