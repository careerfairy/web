import { Box, Stack, SxProps, Theme, Typography } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SystemStyleObject } from "@mui/system"
import { Check } from "react-feather"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   list: {
      listStyleType: "none",
      pl: 0,
   },
   listItem: {
      display: "list-item",
      position: "relative",
      paddingLeft: 3,
      "&:not(:last-child)": {
         mb: 1,
      },
      "&::before": {
         content: "'\\2022'",
         position: "absolute",
         left: 0,
         color: "primary.main",
         fontSize: "2.5rem",
         lineHeight: "1.3rem",
      },
   },
   icon: {
      minWidth: "16px",
      mt: "4px",
   },
})

export const BulletPoints = ({
   points,
   sx,
}: {
   points: string[]
   sx?: SystemStyleObject<DefaultTheme>
}) => {
   return (
      <Box sx={[styles.list, sx]} component="ul">
         {points.map((point) => (
            <Box sx={styles.listItem} component="li" key={point}>
               <Typography variant="body1" color="black">
                  {point}
               </Typography>
            </Box>
         ))}
      </Box>
   )
}

export const CompanyPageBulletPoints = ({
   points,
   typographySx,
}: {
   points: string[]
   typographySx?: SxProps<Theme>
}) => {
   return (
      <Box>
         {points.map((point) => (
            <Stack
               direction="row"
               spacing={1}
               alignItems="flex-start"
               key={point}
            >
               <Box sx={styles.icon} pt={0.5}>
                  <Check strokeWidth={3.5} color="#00D2AA" size={16} />
               </Box>
               <Typography
                  variant="small"
                  color={"neutral.800"}
                  sx={typographySx}
                  fontWeight={400}
               >
                  {point}
               </Typography>
            </Stack>
         ))}
      </Box>
   )
}
