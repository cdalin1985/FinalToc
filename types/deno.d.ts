// types/deno.d.ts
// Minimal ambient declarations to quiet the TypeScript server in the editor
// for files that are executed in a Deno/Edge runtime.

declare const Deno: any;

declare module 'std/server' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

export {};

