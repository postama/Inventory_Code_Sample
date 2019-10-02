import { Item } from '../../../repo/items/item.type';
import { ItemDeletedV1 } from './delete-item-event';

export function deleteItemReducer(item: Item, event: ItemDeletedV1) {
    return {
        ...item,
        deleted: event.created
    };
}