import uuid from 'uuid/v4';
import { entry, createItem } from '../create-item';
import { createItemReducer } from '../create-item-reducer';
import { createTestCreateItemEvent, createTestCreateItemCommand } from './test.util';
import { createCreateItemCommand } from '../create-item-command';
import { createCreateItemEvent } from '../create-item-event';
import { getById } from '../../../../repo/items/item';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

import * as validator from '../../shared/validations';
jest.mock('../../shared/validations.ts');
const validatorMock = validator as jest.Mocked<typeof validator>;

import * as inventoryRepo from '../../../../repo/items/item';
const spy = jest.spyOn(inventoryRepo, 'save');

describe('create inventory item', () => {
    describe('command structure validator', () => {
        test('should fail with missing field with human readable error messages', () => {
            const command = createTestCreateItemCommand({ user: undefined });
            expect.assertions(2);
            try {
                createCreateItemCommand(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should pass without optional fields', () => {
            const command = createTestCreateItemCommand({ supplier: undefined });
            const validCommand = createCreateItemCommand(command);
            expect(validCommand).toMatchSnapshot({
                itemId: expect.any(String),
                customerId: expect.any(String),
                commandId: expect.any(String),
                siteId: expect.any(String)
            });
        });

        test('should pass with full structure', () => {
            const command = createTestCreateItemCommand();
            const validCommand = createCreateItemCommand(command);
            expect(validCommand).toMatchSnapshot({
                itemId: expect.any(String),
                customerId: expect.any(String),
                commandId: expect.any(String),
                siteId: expect.any(String)
            });
        });
    });

    describe('event creator', () => {
        test('should throw if is given a bad command', () => {
            expect.assertions(2);
            try {
                const createItemCommand = createTestCreateItemCommand({ user: undefined });
                createCreateItemEvent(createItemCommand);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should create an event missing optional fields', () => {
            const createItemCommand = createTestCreateItemCommand({ supplier: undefined });
            const event = createCreateItemEvent(createItemCommand);
            expect(event.type).toBe('ItemCreated');
        });

        test('should create an event if issued a valid command', () => {
            const createItemCommand = createTestCreateItemCommand();
            const event = createCreateItemEvent(createItemCommand);
            expect(event.type).toBe('ItemCreated');
        });

        test('unsupported fields should be stripped', () => {
            const createItemCommand = createTestCreateItemCommand({ toStrip: 'stripMe' });
            const event: any = createCreateItemEvent(createItemCommand);
            expect(event.toStrip).toBeUndefined();
        });
    });

    describe('event creator - integration', () => {
        test('should successfully create the item', async () => {
            const command = createTestCreateItemCommand();
            await createItem(command);
            const itemId = spy.mock.calls[0][0].entityId;
            const item = await getById(command.customerId, itemId);
            expect(item.quantity).toBe(0);
        });

        test('should pass when a primary location exists - integration', async () => {
            const command = createTestCreateItemCommand({ primaryLocation: uuid() });
            validatorMock.checkLocationExists.mockResolvedValue();
            await createItem(command);
            const itemId = spy.mock.calls[1][0].entityId;
            const item = await getById(command.customerId, itemId);
            expect(item.primaryLocation).toBe(command.primaryLocation);
            spy.mockReset();
        });
    });

    describe('reducer', () => {
        test('should create an inventory item from an event', () => {
            const event = createTestCreateItemEvent();
            const item = createItemReducer({} as any, event);
            expect(item).toMatchSnapshot({ created: expect.any(String) });
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestCreateItemCommand();
            await entry({ body: JSON.stringify(command) } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });
});
