import { validateType } from '../../../infrastructure/validator/validator';
import uuid from 'uuid/v4';
import { createBaseTestCommand } from '../../../infrastructure/test-util/test.util';

export function createTestLocationCommand(type, validator, overrides?) {
    return {
        ...validateType({
            ...createBaseTestCommand(type),
            locationId: uuid(),
            name: 'abc',
            isActive: true,
            created: (new Date()).getTime().toString()
        }, validator), ...overrides
    };
}