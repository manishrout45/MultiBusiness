/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        prompt: (momentListener?: (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
        }) => void) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            type?: string;
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            logo_alignment?: string;
            width?: number;
          }
        ) => void;
      };
    };
  };
}
