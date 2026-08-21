import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "mg"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});
