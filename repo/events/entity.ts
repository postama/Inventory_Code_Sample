export function getEntityQuery(customerId: string, entityId: string) {
    return {
        KeyConditionExpression: 'customerId = :cust_id and begins_with(genEntityIdTime, :ent_id)',
        IndexName: 'sortedItems',
        ExpressionAttributeValues: {
            ':cust_id': customerId,
            ':ent_id': entityId
        }
    };
}