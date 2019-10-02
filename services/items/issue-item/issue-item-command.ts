import { literal, string, TypeOf, type, intersection } from 'io-ts';
import { validateType } from '../../../infrastructure/validator/validator';
import { BaseQtyCommand } from '../shared/base-command-types';

export const ItemIssuedValidator = intersection([
    BaseQtyCommand,
    type({type: literal('IssueItem'), issuedTo: string}),
]);

export type IssueItemCommand = TypeOf<typeof ItemIssuedValidator>;

export function createIssueCommand(request: any, itemId: string): IssueItemCommand {
    return validateType({ ...request, itemId, type: 'IssueItem' }, ItemIssuedValidator);
}