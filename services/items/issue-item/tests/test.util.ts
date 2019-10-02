import uuid from 'uuid/v4';
import { IssueItemCommand, ItemIssuedValidator } from '../issue-item-command';
import { createIssueItemEvent } from '../issue-item-event';
import { createTestInventoryActionCommand } from '../../shared/test.util';

export function createTestIssueCommand(overrides = {}): IssueItemCommand {
    return createTestInventoryActionCommand('IssueItem', ItemIssuedValidator, overrides, { issuedTo: uuid() });
}

export function createTestIssueItemEvent(commandOverrides = {}, eventOverrides = {}) {
    const command = createTestIssueCommand(commandOverrides);
    const event = { ...createIssueItemEvent(command), ...eventOverrides };
    return event;
}
