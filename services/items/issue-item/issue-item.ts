import { APIGatewayEvent } from 'aws-lambda';
import { ItemIssuedV1, createIssueItemEvent } from './issue-item-event';
import { save, getById } from '../../../repo/items/item';
import { IssueItemCommand, createIssueCommand } from './issue-item-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { issueItemReducer } from './issue-item-reducer';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent): Promise<any> {
    return requestHandler(createIssue, request, request.pathParameters.itemId);
}

export async function createIssue(request: any, itemId: string): Promise<void> {
    const command: IssueItemCommand = createIssueCommand(request, itemId);
    await Promise.all([checkLocationExists(command.customerId, command.locationId), checkUniqueCommand(command)]);
    const event: ItemIssuedV1 = createIssueItemEvent(command);
    const item = await getById(command.customerId, itemId);
    const { locations } = issueItemReducer(item, event);
    event.state = locations;
    await save(event);
    return;
}
