import { Reducer } from './reducer';

describe('reducer class', () => {
    test('should throw if an unidentifed event is found', () => {
        expect.assertions(1);
        try {
            const TestReducer = new Reducer<{ count: number }, { type: string }>();
            TestReducer.reduce({}, [{ type: 'add' }]);
        } catch (e) {
            expect(e.message).toBe('event of type add was found in the reducer, with no handler');
        }
    });

    test('should throw if an event is double registered', () => {
        expect.assertions(1);
        try {
            const TestReducer = new Reducer<{ count: number }, { type: string }>();
            TestReducer.register('add', (accum, event) => ({ count: accum.count + 1 }));
            TestReducer.register('add', (accum, event) => ({ count: accum.count + 1 }));
        } catch (e) {
            expect(e.message).toBe('Event of name add has already been registered');
        }
    });

    test('should work with multiple event types', () => {
        const TestReducer = new Reducer<{ count: number }, { type: string }>();
        TestReducer.register('add', (accum, event) => ({ count: accum.count + 1 }));
        TestReducer.register('subtract', (accum, event) => ({ count: accum.count - 1 }));

        const value = TestReducer.reduce({ count: 0 }, [{ type: 'add' }, { type: 'subtract' }, { type: 'add' }]);
        expect(value.count).toBe(1);
    });
});