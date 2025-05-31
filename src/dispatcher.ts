type CommandHandler = (payload: string) => void;
type AfterCommandHandler = () => void;

export class Dispatcher {
    #subs: Map<string, CommandHandler[]> = new Map();
    #afterHandlers: AfterCommandHandler[] = [];

    subscribe(commandName: string, handler: CommandHandler): () => void {
        if (!this.#subs.has(commandName)) {
            this.#subs.set(commandName, [])
        }
        const handlers = this.#subs.get(commandName);
        if (!handlers) {
            throw new Error("Missing handlers for command");
        }
        if (handlers.includes(handler)) {
            return () => {}
        }
        handlers.push(handler);

        return () => { 
            const idx = handlers.indexOf(handler);
            handlers.splice(idx, 1);
        }
    }
    afterEveryCommand(handler: AfterCommandHandler): () => void {
        this.#afterHandlers.push(handler);

        return () => {
            const idx = this.#afterHandlers.indexOf(handler);
            
            if (idx !== -1) {
                this.#afterHandlers.splice(idx, 1);
            }
        }
    }
    dispatch(commandName: string, payload: string): void {
        const handlers = this.#subs.get(commandName);

        if (handlers) {
            handlers.forEach((handler) => handler(payload));
        } else {
            console.warn(`No handlers for command: ${commandName}`);
        }
        this.#afterHandlers.forEach((handler) => handler());
    }
}
