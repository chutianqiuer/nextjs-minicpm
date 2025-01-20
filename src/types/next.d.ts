declare module 'next/server' {
    export class NextResponse extends Response {
        static json(body: any, init?: ResponseInit): NextResponse
    }
}

declare module 'react' {
    export interface FormEvent<T = Element> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }
    
    export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }
    
    export interface SyntheticEvent<T = Element, E = Event> {
        bubbles: boolean;
        cancelable: boolean;
        currentTarget: EventTarget & T;
        defaultPrevented: boolean;
        eventPhase: number;
        isTrusted: boolean;
        nativeEvent: E;
        preventDefault(): void;
        stopPropagation(): void;
        target: EventTarget;
        timeStamp: number;
        type: string;
    }

    export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
    export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
} 