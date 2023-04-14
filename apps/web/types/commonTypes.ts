import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SystemStyleObject } from "@mui/system"
import { SxProps } from "@mui/material"

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

export function mergeStyles(sx: SxProps<DefaultTheme>) {
   return [...(Array.isArray(sx) ? sx : [sx])]
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
