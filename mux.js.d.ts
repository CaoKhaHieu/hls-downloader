declare module 'mux.js' {
  export const mp4: {
    Transmuxer: new () => {
      on(event: string, callback: (segment: any) => void): void;
      off(event: string): void;
      push(data: Uint8Array): void;
      flush(): void;
    };
  };
} 