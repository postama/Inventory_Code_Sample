import uuid from 'uuid/v4';
import { createTestDeleteCommand, createTestDeleteEvent } from './test.util';
import { createDeleteItemCommand } from '../delete-item-command';
import { createDeleteItemEvent } from '../delete-item-event';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';
import { getById, save } from '../../../../repo/items/item';
import { entry, deleteItem } from '../delete-item';
import { deleteItemReducer } from '../delete-item-reducer';
import { createTestItem } from '../../../../repo/items/test/test-util';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('delete inventory item', () => {
    describe('create command', () => {
        test('should fail without commandId with a human readable error message', () => {
            const command = createTestDeleteCommand({ customerId: undefined });
            expect.assertions(2);
            try {
                createDeleteItemCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at customerId but instead got: undefined.');
            }
        });

        test('should create a command if provided proper structure', () => {
            const command = createTestDeleteCommand();
            const validCommand = createDeleteItemCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('create event', () => {
        test('should fail if given a bad command', () => {
            expect.assertions(2);
            try {
                const command = createTestDeleteCommand({ commandId: undefined });
                createDeleteItemEvent(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at commandId but instead got: undefined.');
            }
        });

        test('should create event if given a valid command', () => {
            const command = createTestDeleteCommand();
            const event = createDeleteItemEvent(command);
            expect(event.type).toBe('ItemDeleted');
        });
    });

    describe('delete event - integration', () => {
        test('should successfully remove the item', async () => {
            const event = createTestCreateItemEvent();
            await save(event);
            const deleteCommand = createTestDeleteCommand({ customerId: event.customerId });
            await deleteItem(deleteCommand, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item).toMatchSnapshot({
                deleted: expect.any(String),
                created: expect.any(String)
            });
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestDeleteCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('reducer', () => {
        test('should add deleted to the item', async () => {
            const event = createTestDeleteEvent();
            const item = createTestItem();
            const deletedItem = deleteItemReducer(item, event);
            expect(deletedItem.deleted).toBe(event.created);
        });
    });
});