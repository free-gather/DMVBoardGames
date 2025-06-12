import type { FeatureFlagSetting } from "./types/FeatureFlagConfig.ts";

export const API_ROOT: string = window.location.href.includes(
  "https://dmvboardgames.com/",
)
  ? `${import.meta.env.VITE_API_ROOT}`
  : import.meta.env.VITE_LOCAL_API_ROOT;

export const USE_MOCK: boolean = import.meta.env.VITE_USE_API_MOCK === "true";

export const IS_PRODUCTION = window.location.href.includes(
  "https://dmvboardgames.com/",
);

export const FEATURE_FLAGS: Record<string, FeatureFlagSetting> = {
  loginEnabled: {
    devEnabled: true,
    prodEnabled: false,
  },
};

export const SUPABASE_CLIENT_URL = IS_PRODUCTION
  ? "https://karqyskuudnvfxohwkok.supabase.co"
  : import.meta.env.VITE_LOCAL_AUTH_URL;

export const SUPABASE_CLIENT_KEY = IS_PRODUCTION
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcnF5c2t1dWRudmZ4b2h3a29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5ODQ5NjgsImV4cCI6MjA1NzU2MDk2OH0.TR-Pn6dknOTtqS9y-gxK_S1-nw6TX-sL3gRH2kXJY_I"
  : import.meta.env.VITE_LOCAL_AUTH_KEY;

export const AUTH_TOKEN_KEY = IS_PRODUCTION
  ? "sb-karqyskuudnvfxohwkok-auth-token"
  : import.meta.env.VITE_LOCAL_AUTH_TOKEN_KEY;
