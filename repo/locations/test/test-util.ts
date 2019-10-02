import { Location } from '../location-type';

export function createTestLocation(overrides?): Location {
    return {
        name: 'abc',
        description: 'abc',
        created: (new Date()).getTime().toString(),
        ...overrides
    };
}