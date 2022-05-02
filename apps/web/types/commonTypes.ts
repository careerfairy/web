import { Theme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

export type StylesProps = {
   [key: string]: SxProps<Theme>
}
