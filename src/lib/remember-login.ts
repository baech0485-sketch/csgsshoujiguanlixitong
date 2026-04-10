export const REMEMBER_LOGIN_STORAGE_KEY = "csgs_remembered_login";

export type RememberedLoginState = {
  password: string;
  rememberPassword: boolean;
};

type LoginStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function createDefaultState(): RememberedLoginState {
  return {
    password: "",
    rememberPassword: true,
  };
}

export function getDefaultRememberedLoginState(storage?: LoginStorage | null) {
  const fallback = createDefaultState();
  if (!storage) return fallback;

  try {
    const savedValue = storage.getItem(REMEMBER_LOGIN_STORAGE_KEY);
    if (!savedValue) return fallback;

    const parsed = JSON.parse(savedValue) as { password?: string };
    return {
      password: parsed.password || "",
      rememberPassword: true,
    };
  } catch {
    storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
    return fallback;
  }
}

export function getBrowserRememberedLoginState() {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  return getDefaultRememberedLoginState(window.localStorage);
}

export function persistRememberedLogin(storage: LoginStorage, state: RememberedLoginState) {
  if (!state.rememberPassword) {
    storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY);
    return;
  }

  storage.setItem(
    REMEMBER_LOGIN_STORAGE_KEY,
    JSON.stringify({
      password: state.password,
    }),
  );
}

export function persistBrowserRememberedLogin(state: RememberedLoginState) {
  if (typeof window === "undefined") return;
  persistRememberedLogin(window.localStorage, state);
}
