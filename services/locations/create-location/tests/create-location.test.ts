import { createTestCreateLocationCommand, createTestCreateLocationEvent } from './test.util';
import { createCreateLocationCommand } from '../create-location-command';
import { createCreateLocationEvent } from '../create-location-event';
import { createLocationReducer } from '../create-location-reducer';
import { entry, createLocation } from '../create-location';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

import * as locationRepo from '../../../../repo/locations/location';
const spy = jest.spyOn(locationRepo, 'save');

describe('create location', () => {
    describe('command structure validator', () => {
        test('should fail without user with a human readable error message', () => {
            const command = createTestCreateLocationCommand({ user: undefined });
            expect.assertions(2);
            try {
                createCreateLocationCommand(command);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should pass with full structure', () => {
            const command = createTestCreateLocationCommand();
            const validCommand = createCreateLocationCommand(command);
            expect(validCommand).toMatchSnapshot({
                locationId: expect.any(String),
                customerId: expect.any(String),
                commandId: expect.any(String),
                siteId: expect.any(String)
            });
        });
    });

    describe('event creator', () => {
        test('should throw if given a bad command', () => {
            expect.assertions(2);
            try {
                const createLocationCommand = createTestCreateLocationCommand({ user: undefined });
                createCreateLocationEvent(createLocationCommand);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should create an event if given a good commmand', () => {
            const createLocationCommand = createTestCreateLocationCommand();
            const event = createCreateLocationEvent(createLocationCommand);
            expect(event.type).toBe('LocationCreated');
        });
    });

    describe('reducer', () => {
        test('should create a location from an event', () => {
            const event = createTestCreateLocationEvent();
            const location = createLocationReducer({} as any, event);
            expect(location).toMatchSnapshot({
                created: expect.any(String)
            });
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestCreateLocationCommand();
            await entry({ body: JSON.stringify(command) } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('integration', () => {
        test('should successfully create the location', async () => {
            const command = createTestCreateLocationCommand();
            await createLocation(command);
            const locationId = spy.mock.calls[0][0].entityId;
            const location = await locationRepo.getById(command.customerId, locationId);
            expect(location).toMatchSnapshot({
                created: expect.any(String)
            });
        });
    });
});