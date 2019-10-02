import { DocumentClient, QueryInput, PutItemInput, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { Reducer } from '../reducer/reducer';
import { isEmpty } from '../util/hasValues';
import { BaseEvent, BaseEventValidator } from '../../repo/events/event-type';
import { validateType } from '../validator/validator';
import config from '../../appconfig.json';
const dynamoConfig = config[(process.env.NODE_CONFIG_ENV || process.env.NODE_ENV)].dynamoDB;

const dynamo = new DocumentClient(dynamoConfig.options);
const TableName = dynamoConfig.tableName;

export async function query<T>(params, options = {}): Promise<T[]> {
    const enhancedParams: QueryInput = { TableName, ...params, ...options };
    const data = await dynamo.query(enhancedParams).promise();
    return data.Items as any;
}

export async function getById<T>(params): Promise<T | null> {
    const results = await query<T>(params);
    return allowOne(results, params);
}

export function allowOne(arr, params) {
    if (!arr || !arr.length) return null;
    if (arr.length > 1) throw new Error(`Expected one result for dynamo query with params ${JSON.stringify(params)}`);
    return arr[0];
}

export async function put(item: BaseEvent): Promise<void> {
    // Final validator to make sure nothing ends up in the DB that it isn't set up for.
    validateType(item, BaseEventValidator);
    const enhancedParams: PutItemInput = { TableName, Item: item as PutItemInputAttributeMap };
    await dynamo.put(enhancedParams).promise();
    return;
}

export async function pagedReducer<T extends object, E extends { type: string }>(reducer: Reducer<T, E>, params: object, accum: T | {} = {}, options: queryOptions = { Limit: 100 }): Promise<T> {
    const enhancedParams: QueryInput = { TableName, ...params, ...options };
    const data = await dynamo.query(enhancedParams).promise();
    const items: E[] = data.Items as E[];
    const newValue = reducer.reduce(accum, items);
    if (data.LastEvaluatedKey) return pagedReducer<T, E>(reducer, params, { ...options, ExclusiveStartKey: data.LastEvaluatedKey }, newValue);
    if (!newValue || isEmpty(newValue)) return null;
    return newValue;
}

export async function pagedTask(params: object, fn: (...args: any[]) => Promise<void>, options: queryOptions = { Limit: 100 }): Promise<void> {
    const enhancedParams: QueryInput = { TableName, ...params, ...options };
    const data = await dynamo.query(enhancedParams).promise();
    const items = data.Items;
    for (const i of items) await fn(i);
    if (data.LastEvaluatedKey) return pagedTask(params, fn, { ...options, ExclusiveStartKey: data.LastEvaluatedKey });
}

type queryOptions = {
    Limit?: number,
    ExclusiveStartKey?: any
};
