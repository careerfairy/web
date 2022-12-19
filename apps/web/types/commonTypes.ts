import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SystemStyleObject } from "@mui/system"

/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

export type StylesProps = {
   [propName: string]: SystemStyleObject<DefaultTheme>
}

/**
 * This function doesn't really “do anything” at runtime, it's just the identity function.
 * Its only purpose is to defeat TypeScript's type widening when providing style rules
 *
 * This is a replacement for createStyles from @mui/styles package that is deprecated
 *
 * @param obj
 */
export function sxStyles<TObject extends SystemStyleObject<DefaultTheme>>(
   obj: TObject
): TObject {
   return obj
}

/**
 * All ours possible colors
 */
export type IColors =
   | "inherit"
   | "action"
   | "disabled"
   | "primary"
   | "secondary"
   | "error"
   | "info"
   | "success"
   | "warning"
