import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import kh from "@/locales/kh.json";
import kr from "@/locales/kr.json";
import { LOCALES, type Locale } from "./locales";

/**
 * i18next init for Jalat's three locales: English (en), Khmer (kh), Korean (kr).
 * English is the source/fallback; kh/kr fall back to en for any missing key.
 * Resources are bundled now; later these can split into per-feature namespaces.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      kh: { translation: kh },
      kr: { translation: kr },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export { LOCALES, type Locale };

export default i18n;
