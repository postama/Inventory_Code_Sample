import { checkLocationExists } from '../validations';
import uuid from 'uuid/v4';
import { Location } from '../../../../repo/locations/location-type';

import * as locations from '../../../../repo/locations/location';
jest.mock('../../../../repo/locations/location.ts');
const locationMock = locations as jest.Mocked<typeof locations>;

describe('validations test', () => {
    describe('location exists', () => {
        test('should succeed if location exists', async () => {
            locationMock.getById.mockResolvedValue({} as Location);
            await checkLocationExists(uuid(), uuid());
        });

        test('should throw if location does not exist', async () => {
            locationMock.getById.mockResolvedValue(null);
            const locationId = uuid();
            expect.assertions(1);
            try {
                await checkLocationExists(uuid(), locationId);
            } catch (e) {
                expect(e.message).toBe(`Location ${locationId} does not exist`);
            }
        });

        test('should throw if location is inactive and active is required', async () => {
            locationMock.getById.mockResolvedValue({ isActive: false } as Location);
            const locationId = uuid();
            expect.assertions(1);
            try {
                await checkLocationExists(uuid(), locationId, true);
            } catch (e) {
                expect(e.message).toBe(`Location ${locationId} is not active`);
            }
        });
    });
});