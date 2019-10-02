import { ValidationError as ioValidationError, exact } from 'io-ts';
import { ValidationError } from '../../../Kanso.Doorways.InventoryShared/errors';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';

export function validateType(body, validator) {
    return pipe(
        exact(validator).decode(body),
        fold(
            errors => { throw new ValidationError(formatValidationError(errors)); },
            value => value
        )
    ) 
}

function formatValidationError(errors: ioValidationError[]) {
    return errors
        .map(e => e.context
            // Filter out empty keys
            .filter(c => c.key.length > 0)
            // Filter out numerical keys (used when using intersection)
            .filter(c => parseInt(c.key, 10).toString() !== c.key)
            .map(c => `Expecting ${c.type.name} at ${c.key} but instead got: ${e.value === undefined ? 'undefined' : JSON.stringify(e.value)}.`)
            .join(''))
        .join('/n');
}
