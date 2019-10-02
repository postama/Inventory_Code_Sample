import { GetRecordsOutput } from 'aws-sdk/clients/dynamodbstreams';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { PublishInput } from 'aws-sdk/clients/sns';

export function convertDynamoToSNSMessage(event: GetRecordsOutput): PublishInput[] {
    const records = event.Records.map(r => Converter.unmarshall(r.dynamodb.NewImage));
    const messages = records.map(r => ({
        Message: JSON.stringify(r),
        Subject: r.type,
        TopicArn: process.env.snsArn,
        MessageAttributes: {
            Type: {
                DataType: 'String',
                StringValue: r.type
            }
        }
    }));
    return messages;
}