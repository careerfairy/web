/**
 * If you want to enable locale keys typechecking and enhance IDE experience.
 *
 * Requires `resolveJsonModule:true` in your tsconfig.json.
 *
 * @link https://www.i18next.com/overview/typescript
 */
import "i18next"

import common from "./public/locales/en/common.json"
import components from "./public/locales/en/components.json"
import levels from "./public/locales/en/levels.json"

interface I18nNamespaces {
   common: typeof common
   components: typeof components
   levels: typeof levels
}

declare module "i18next" {
   interface CustomTypeOptions {
      defaultNS: "common"
      resources: I18nNamespaces
   }
}
