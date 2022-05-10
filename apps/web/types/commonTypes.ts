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
