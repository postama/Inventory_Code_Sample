import uuid from 'uuid/v4';

export function createBaseTestCommand(type) {
    return {
        commandId: uuid(),
        customerId: `TESTER`,
        user: 'abc',
        siteId: `TESTER`,
        type
    };
}