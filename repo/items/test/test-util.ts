import uuid from 'uuid/v4';
import { Item, ItemData } from '../item.type';

export function createTestBaseItemInfo(overrides?): ItemData {
    return {
        ...{
            group: 'abc',
            name: 'abc',
            unitOfMeasurement: 'abc',
            costPerUnit: 123,
            identifier: 'abc',
            brand: 'abc',
            supplier: 'abc',
            isPreferred: true
        },
        ...overrides
    };
}

export function createTestItem(overrides?): Item {
    return {
        ...createTestBaseItemInfo(),
        ... {
            quantity: 1,
            itemId: uuid(),
            created: (new Date()).getTime().toString(),
            locations: []
        },
        ...overrides
    };
}