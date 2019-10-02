import uuid from 'uuid/v4';
import { createTestEditLocationCommand, createTestEditLocationEvent } from './test.util';
import { createEditLocationCommand } from '../edit-location-command';
import { createEditLocationEvent } from '../edit-location-event';
import { createTestLocation } from '../../../../repo/locations/test/test-util';
import { editLocationReducer } from '../edit-location-reducer';
import { entry, editLocation } from '../edit-location';
import { createTestCreateLocationEvent } from '../../create-location/tests/test.util';
import { save, getById } from '../../../../repo/locations/location';
import { LocationCreatedV1 } from '../../create-location/create-location-event';

import * as entryLib from '../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
jest.mock('../../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper');
const entryMock = entryLib as jest.Mocked<typeof entryLib>;

describe('edit location', () => {
    describe('command structure validator', () => {
        test('should fail without user with a human readable error message', () => {
            const command = createTestEditLocationCommand({ user: undefined });
            expect.assertions(2);
            try {
                createEditLocationCommand(command, uuid());
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should pass with full structure', () => {
            const command = createTestEditLocationCommand();
            const validCommand = createEditLocationCommand(command, uuid());
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
                const editLocationCommand = createTestEditLocationCommand({ user: undefined });
                createEditLocationEvent(editLocationCommand);
            } catch (e) {
                expect(e.name).toBe('ValidationError');
                expect(e.message).toBe('Expecting string at user but instead got: undefined.');
            }
        });

        test('should create an event if given a good command', () => {
            const editLocationCommand = createTestEditLocationCommand();
            const event = createEditLocationEvent(editLocationCommand);
            expect(event.type).toBe('LocationEdited');
        });
    });

    describe('reducer', () => {
        test('should edit a location from an event', () => {
            const location = createTestLocation();
            const event = createTestEditLocationEvent({ name: 'xyz' });
            const editedLocation = editLocationReducer(location, event);
            expect(editedLocation.name).toBe('xyz');
        });

        test('should not modify the created date of the location', () => {
            const location = createTestLocation();
            const event = createTestEditLocationEvent({ name: 'xyz' });
            const editedLocation = editLocationReducer(location, event);
            expect(editedLocation.created).toBe(location.created);
        });
    });

    describe('entry', () => {
        test('should call the entry handler', async () => {
            const command = createTestEditLocationCommand();
            await entry({ body: JSON.stringify(command), pathParameters: { itemId: uuid() } } as any);
            expect(entryMock.requestHandler).toBeCalled();
        });
    });

    describe('edit location - integration', () => {
        test('should successfully edit the location', async () => {
            const event: LocationCreatedV1 = createTestCreateLocationEvent();
            await save(event);
            const editCommand = createTestEditLocationCommand({ customerId: event.customerId, name: 'xyz' });
            await editLocation(editCommand, event.entityId);
            const item = await getById(event.customerId, event.entityId);
            expect(item.name).toBe('xyz');
        });
    });
});