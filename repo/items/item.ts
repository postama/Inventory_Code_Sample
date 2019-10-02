import * as dynamo from '../../infrastructure/persistence/dynamo';
import { ItemEvent } from './item-event-types';
import { Item } from './item.type';
import { Reducer } from '../../infrastructure/reducer/reducer';
import { getEntityQuery } from '../events/entity';
import { CREATE_ITEM } from '../../services/items/create-item/create-item-event';
import { createItemReducer } from '../../services/items/create-item/create-item-reducer';
import { ADJUST_ITEM } from '../../services/items/adjust-qty/adjust-qty-event';
import { adjustQtyReducer } from '../../services/items/adjust-qty/adjust-qty-reducer';
import { ITEM_ISSUED } from '../../services/items/issue-item/issue-item-event';
import { issueItemReducer } from '../../services/items/issue-item/issue-item-reducer';
import { DISPOSE_ITEM } from '../../services/items/dispose-item/dispose-item-event';
import { disposeItemReducer } from '../../services/items/dispose-item/dispose-item-reducer';
import { RECEIVE_ITEM } from '../../services/items/receive-item/receive-item-event';
import { receiveItemReducer } from '../../services/items/receive-item/receive-item-reducer';
import { DELETE_ITEM } from '../../services/items/delete-item/delete-item-event';
import { deleteItemReducer } from '../../services/items/delete-item/delete-item-reducer';
import { EDIT_ITEM } from '../../services/items/edit-item/edit-item-event';
import { editItemReducer } from '../../services/items/edit-item/edit-item-reducer';
import { TRANSFER_ITEM } from '../../services/items/transfer-item/transfer-item-event';
import { transferItemReducer } from '../../services/items/transfer-item/transfer-item-reducer';

export const ItemReducer = new Reducer<Item, ItemEvent>();

// Code smell - breaking Open/Closed Principal these should be registered by their reducers, not in a central file.
// Not sure how to fix this - they need to be registered for every code split lambda, but how will each code split lambda bring in the code from the other events?
ItemReducer.register(CREATE_ITEM, createItemReducer);
ItemReducer.register(ADJUST_ITEM, adjustQtyReducer);
ItemReducer.register(ITEM_ISSUED, issueItemReducer);
ItemReducer.register(DISPOSE_ITEM, disposeItemReducer);
ItemReducer.register(RECEIVE_ITEM, receiveItemReducer);
ItemReducer.register(DELETE_ITEM, deleteItemReducer);
ItemReducer.register(EDIT_ITEM, editItemReducer);
ItemReducer.register(TRANSFER_ITEM, transferItemReducer);

export async function getById(customerId: string, itemId: string): Promise<Item> {
    return await dynamo.pagedReducer<Item, ItemEvent>(ItemReducer, getEntityQuery(customerId, itemId));
}

export async function save(event: ItemEvent) {
    return await dynamo.put(event);
}
