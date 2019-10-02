import uuid from 'uuid/v4';
import { createTestEditCommand, createTestEditItemEvent } from './test.util';
import { createEditItemCommand } from '../edit-item-command';
import { createEditItemEvent } from '../edit-item-event';
import { createTestItem } from '../../../../repo/items/test/test-util';
import { editItemReducer } from '../edit-item-reducer';
import { entry, editItem } from '../edit-item';
import { getById, save } from '../../../../repo/items/item';
import { createTestCreateItemEvent } from '../../create-item/tests/test.util';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

import * as validator from '../../shared/validations';
jest.mock('../../shared/validations.ts');
const validatorMock = validator as jest.Mocked<typeof validator>;

describe('edit inventory item', () => {
    describe('command structure validator', () => {
        test('should fail without commandId with a human readable error message', () => {
            const command = createTestEditCommand({ user: undefined });
            expect.assertions(2);
            try {
                createEditItemCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should pass with proper structure', () => {
            const command = createTestEditCommand();
            const validCommand = createEditItemCommand(command, command.itemId);
            expect(validCommand).toEqual(command);
        });
    });

    describe('event creator', () => {
        test('should throw if is given a bad command', () => {
            expect.assertions(2);
            try {
                const editItemCommand = createTestEditCommand({ user: undefined });
                createEditItemEvent(editItemCommand);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should create an event if issued a valid command', () => {
            const editItemCommand = createTestEditCommand();
            const event = createEditItemEvent(editItemCommand);
            expect(event.type).toBe('ItemEdited');
        });
    });

    describe('reducer', () => {
        test('should edit an inventory item from an event', () => {
            const item = createTestItem();
            const event = createTestEditItemEvent({ group: 'xyz' });
            const editedItem = editItemReducer(item, event);
            expect(editedItem.group).toBe('xyz');
        });

        test('should not modify the quantity of the item', () => {
            const item = createTestItem({ quantity: 5 });
            const event = createTestEditItemEvent({ group: 'xyz' });
            const editedItem = editItemReducer(item, event);
            expect(editedItem.quantity).toBe(5);
        });

        test('should fail if no item is provided', () => {
            const event = createTestEditItemEvent();
            expect.assertions(1);
            try {
                editItemReducer({} as any, event);
            } catch (e) {
                expect(e.message).toBe('Item does not exist, event cannot be processed');
            }
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestEditCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('edit event - integration', () => {
        test('should successfully edit the item', async () => {
            const event = createTestCreateItemEvent();
            await save(event);
            const editCommand = createTestEditCommand({ customerId: event.customerId, group: 'xyz' });
            await editItem(editCommand, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.group).toBe('xyz');
        });

        test('should pass when a primary location exists - integration', async () => {
            const event = createTestCreateItemEvent();
            await save(event);
            const command = createTestEditCommand({ customerId: event.customerId, primaryLocation: uuid() });
            validatorMock.checkLocationExists.mockResolvedValue();
            await editItem(command, event.entityId);
            const item = await getById(command.customerId, event.entityId);
            expect(item.primaryLocation).toBe(command.primaryLocation);
        });
    });
});