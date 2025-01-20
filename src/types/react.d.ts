/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
    interface JSX {
        IntrinsicElements: {
            [elemName: string]: any;
        }
    }
} 