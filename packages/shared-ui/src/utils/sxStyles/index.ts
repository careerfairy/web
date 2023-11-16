import { Theme } from "@mui/material"
import { SystemStyleObject } from "@mui/system"

/**
 * This function doesn't really “do anything” at runtime, it's just the identity function.
 * Its only purpose is to defeat TypeScript's type widening when providing style rules
 *
 * This is a replacement for createStyles from @mui/styles package that is deprecated
 *
 * @param obj
 */
export const sxStyles = <TObject extends SystemStyleObject<Theme>>(
   obj: TObject
): TObject => {
   return obj
}
