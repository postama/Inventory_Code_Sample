import uuid from 'uuid/v4';
import { createBaseTestCommand } from '../../../infrastructure/test-util/test.util';
import { validateType } from '../../../infrastructure/validator/validator';

export function createTestInventoryCommand(type, validator, overrides = {}, base = {}) {
    return {
        ...validateType({
            ...base,
            ...createBaseTestCommand(type),
            itemId: uuid()
        }, validator), ...overrides
    };
}

export function createTestInventoryActionCommand(type, validator, overrides = {}, base = {}) {
    return {
        ...validateType({
            ...base,
            ...createBaseTestCommand(type),
            itemId: uuid(),
            quantity: 1,
            locationId: uuid(),
            description: 'test description'
        }, validator), ...overrides
    };
}