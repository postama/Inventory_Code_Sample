import { allowOne, pagedTask } from './dynamo';

const querySpy = { result: null };

jest.mock('aws-sdk/clients/dynamodb', () => {
    class DocumentClient {
        query() {
            return { promise: async () => querySpy.result() };
        }
    }
    return { DocumentClient };
});
// only testing cases where dynamo is being extended, not testing the dynamo api itself

describe('Dynamo Extensions', () => {
    describe('allow one', () => {
        test('should return null if undefined array', () => {
            const result = allowOne(undefined, { TableName: 'abcd' });
            expect(result).toBeNull();
        });

        test('should return null with empty array', () => {
            const result = allowOne([], { TableName: 'abcd' });
            expect(result).toBeNull();
        });

        test('should return first item if only one item', () => {
            const result = allowOne(['a'], { TableName: 'abcd' });
            expect(result).toBe('a');
        });

        test('should throw if more than one item', () => {
            try {
                allowOne(['a', 'b'], { TableName: 'abcd' });
            } catch (e) {
                expect(e.message).toBe(`Expected one result for dynamo query with params {\"TableName\":\"abcd\"}`);
            }
        });
    });

    describe('paged task', () => {
        test('should call the function for each item', async () => {
            querySpy.result = jest.fn().mockReturnValueOnce({ Items: ['a', 'b'] });
            const taskSpy = jest.fn();
            await pagedTask({}, taskSpy);
            expect(taskSpy.mock.calls[0][0]).toBe('a');
            expect(taskSpy.mock.calls[1][0]).toBe('b');
        });

        test('should iterate if result has a last evaluated key', async () => {
            querySpy.result = jest.fn()
                .mockReturnValueOnce({ Items: ['a', 'b'], LastEvaluatedKey: 'abc' })
                .mockReturnValueOnce({ Items: ['c', 'd'] });

            const taskSpy = jest.fn();

            await pagedTask({}, taskSpy);

            expect(taskSpy.mock.calls[2][0]).toBe('c');
            expect(taskSpy.mock.calls[3][0]).toBe('d');
        });
    });
});