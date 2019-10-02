import { createTestCreateLocationEvent } from '../../../services/locations/create-location/tests/test.util';
import { save, getById } from '../location';
import { LocationCreatedV1 } from '../../../services/locations/create-location/create-location-event';

describe('location aggregate root', () => {
    describe('getById', () => {
        test('should get a location', async () => {
            const event: LocationCreatedV1 = createTestCreateLocationEvent();
            await save(event);
            const location = await getById(event.customerId, event.entityId);
            expect(location).toMatchSnapshot({
                created: expect.any(String)
            });
        });
    });
});