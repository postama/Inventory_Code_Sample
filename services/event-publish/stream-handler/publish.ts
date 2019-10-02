import 'source-map-support/register';
import SNS from 'aws-sdk/clients/sns';
import { GetRecordsOutput } from 'aws-sdk/clients/dynamodbstreams';
import { convertDynamoToSNSMessage } from './message-converter';

export async function publishItem(event: GetRecordsOutput) {
    const sns = new SNS();
    await Promise.all(convertDynamoToSNSMessage(event).map(m => sns.publish(m).promise()));
}
