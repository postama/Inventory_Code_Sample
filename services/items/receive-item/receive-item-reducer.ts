import { Item } from '../../../repo/items/item.type';
import { isEmpty } from '../../../infrastructure/util/hasValues';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';
import { ItemReceivedV1 } from './receive-item-event';

export function receiveItemReducer(item: Item, event: ItemReceivedV1): Item {
    if (isEmpty(item)) throw new ValidationError('Item does not exist, event cannot be processed');
    return {
        ...item,
        quantity: item.quantity + event.data.quantity,
        locations: {
            ...item.locations,
            [event.data.locationId]: (item.locations[event.data.locationId] || 0) + event.data.quantity
        }
    };
}