import { useLocalStorageState } from "./useLocalStorageState";
import type { Lang } from "../types";

const LANG_KEY = "botc-lang";

function detectDefaultLang(): Lang {
  return navigator.language.toLowerCase().startsWith("sv") ? "sv" : "en";
}

export function useLang() {
  const [lang, setLang] = useLocalStorageState<Lang>(LANG_KEY, detectDefaultLang());
  return [lang, setLang] as const;
}
