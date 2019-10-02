export class Reducer<T, E extends { type: string }> {
    reducer: { [eventName: string]: ReducerFunction<T, E> } = {};

    public register(name: string, func: ReducerFunction<T, E>) {
        if (this.reducer[name]) throw new Error(`Event of name ${name} has already been registered`);
        this.reducer[name] = func;
    }

    public run(accum: T | {}, event: E) {
        if (!this.reducer[event.type]) throw new Error(`event of type ${event.type} was found in the reducer, with no handler`);
        return this.reducer[event.type](accum as T, event);
    }

    public reduce(accum: T | {}, events: E[]): T {
        return events.reduce(this.run.bind(this), accum) as T;
    }
}

export type ReducerFunction<T, E> = (accum: T, event: E) => T;
