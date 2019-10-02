import { AdjustItemQtyCommand, ItemAdjustmentValidator } from '../adjust-qty-command';
import { createAdjustQtyEvent } from '../adjust-qty-event';
import { createTestInventoryActionCommand } from '../../shared/test.util';

export function createTestAdjustCommand(overrides = {}): AdjustItemQtyCommand {
    return createTestInventoryActionCommand('AdjustItemQty', ItemAdjustmentValidator, overrides);
}

export function createTestAdjustEvent(commandOverrides = {}, eventOverrides = {}) {
    const command = createTestAdjustCommand(commandOverrides);
    const event = { ...createAdjustQtyEvent(command), ...eventOverrides };
    return event;
}
