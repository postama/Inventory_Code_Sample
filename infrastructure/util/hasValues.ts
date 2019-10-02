export function hasValues(object: object): boolean {
    return object && Object.keys(object).length > 0;
}

export function isEmpty(object: object): boolean {
    return !hasValues(object);
}