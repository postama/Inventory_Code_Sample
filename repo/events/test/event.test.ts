import { checkUniqueCommand } from '../event';
import { save } from '../../items/item';
import { createTestCreateItemEvent } from '../../../services/items/create-item/tests/test.util';

describe('event repo', () => {
    test('should throw if a duplicate command is found', async () => {
        const event = createTestCreateItemEvent();
        await save(event);
        expect.assertions(1);
        try {
            await checkUniqueCommand(event);
        } catch (e) {
            expect(e.message).toMatch(new RegExp('^Command.*'));
        }
    });
});