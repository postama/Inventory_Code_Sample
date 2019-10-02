import { convertDynamoToSNSMessage } from './message-converter';

describe('message converter', () => {
    beforeAll(() => process.env.snsArn = 'test');

    test('should create a sns event for one record', () => {
        const result = convertDynamoToSNSMessage(createMessages([{S: 'test'}]));
        expect(result).toMatchSnapshot();
    });

    test('should create an sns event for each record (2)', () => {
        const result = convertDynamoToSNSMessage(createMessages([{S: 'test'}, {S: 'test2'}]));
        expect(result).toMatchSnapshot();
    });
});

function createMessages(items) {
    return {
        Records: items.map(i => ({
            eventID: 'test',
            eventName: 'INSERT',
            eventVersion: '1.1',
            eventSource: 'aws:dynamodb',
            awsRegion: 'test',
            dynamodb: {
                ApproximateCreationDateTime: new Date('2019-03-21T21:36:00.000Z'),
                Keys: {
                    customerId: { S: 'test' },
                    commandId: { S: 'test' }
                },
                NewImage: {
                    test: i
                },
                SequenceNumber: 'test',
                SizeBytes: 100,
                StreamViewType: 'NEW_IMAGE'
            }
        })),
        NextShardIterator: 'test'
    };
}
