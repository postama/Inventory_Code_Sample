import * as dynamo from '../../infrastructure/persistence/dynamo';
import { ValidationError } from '../../../Kanso.Doorways.InventoryShared/errors';
import { Event } from './event-types';

export async function getById(customerId: string, commandId: string): Promise<Event> {
    const params = {
        KeyConditionExpression: 'customerId = :cust_id and commandId = :comm_id',
        ExpressionAttributeValues: {
            ':cust_id': customerId,
            ':comm_id': commandId
        }
    };

    return await dynamo.getById<Event>(params);
}

export async function checkUniqueCommand<T extends { customerId: string, commandId: string }>(command: T): Promise<T> {
    const event = await getById(command.customerId, command.commandId);
    if (event) throw new ValidationError(`Command ${command.commandId} has already been processed`);
    return command;
}
