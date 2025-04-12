// env.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      // Add other environment variables here
    }
  }
}
