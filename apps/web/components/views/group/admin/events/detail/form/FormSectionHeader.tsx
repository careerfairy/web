import { FC, ReactNode } from "react"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Typography } from "@mui/material"

const styles = sxStyles({
   sectionDivider: {
      marginTop: "32px !important",
   },
   formHeader: {
      flexGrow: 1,
   },
   formHeaderTitle: {
      marginBottom: "5px",
   },
})

type FormSectionHeaderProps = {
   title: string
   subtitle: string
   actions?: ReactNode
   divider?: boolean
}

const FormSectionHeader: FC<FormSectionHeaderProps> = ({
   title,
   subtitle,
   actions,
   divider = false,
}) => {
   return (
      <Stack
         direction={{ xs: "column", md: "row" }}
         sx={divider ? styles.sectionDivider : null}
      >
         <Box sx={styles.formHeader}>
            <Typography
               variant="h5"
               fontWeight="bold"
               sx={styles.formHeaderTitle}
            >
               {title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
               {subtitle}
            </Typography>
         </Box>
         {actions}
      </Stack>
   )
}

export default FormSectionHeader
