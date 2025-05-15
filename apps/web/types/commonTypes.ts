import { SxProps, Theme } from "@mui/material"
import { SystemStyleObject } from "@mui/system"

/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

export type StylesProps = {
   [propName: string]: SystemStyleObject<Theme>
}

/**
 * This function doesn't really “do anything” at runtime, it's just the identity function.
 * Its only purpose is to defeat TypeScript's type widening when providing style rules
 *
 * This is a replacement for createStyles from @mui/styles package that is deprecated
 *
 * @param obj
 */
export function sxStyles<TObject extends SystemStyleObject<Theme>>(
   obj: TObject
): TObject {
   return obj
}

/**
 * This function combines the styles provided by the component and the styles provided by the props.
 * The function returns a flattened array of styles.
 *
 * @param {...SxProps} styles - The styles provided by the component and the props.
 * @returns An array of styles.
 */
export function combineStyles(...styles: SxProps[]) {
   return styles.flat()
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
