import Typography, { type TypographyProps } from "@mui/material/Typography"
import { styled } from "@mui/material"
import BaseStyles from "./BaseStyles"

export const SectionHeader = styled((props: TypographyProps<"h4">) => (
   <Typography
      component="h4"
      gutterBottom
      sx={BaseStyles.section.h4}
      {...props}
   />
))()

export const SectionSubHeader = styled((props: TypographyProps<"h5">) => (
   <Typography component="h5" sx={BaseStyles.section.h5} {...props} />
))()
