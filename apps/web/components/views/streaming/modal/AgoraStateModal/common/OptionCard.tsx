import React, { FC } from "react"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import { ButtonProps, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

const styles = {
   root: {
      p: 2,
      position: "relative",
      border: (theme) => `1px solid ${theme.palette.grey["300"]}`,
   },
   clickable: {
      cursor: "pointer",
      transition: (theme) =>
         theme.transitions.create(["border", "background-color"]),
      "&:hover, &:focus": {
         border: (theme) => `1px solid ${theme.palette.grey["600"]}`,
         backgroundColor: "background.default",
      },
   },
   number: {
      fontSize: "2rem",
      fontWeight: 600,
   },
   numberWrapper: {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
   },
   detailsWrapper: {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center start",
   },
} as const
export interface OptionCardProps {
   title: string
   description?: string
   number?: number | string
   onClick?: () => void
   actionButtonProps?: ButtonProps
}
const OptionCard: FC<OptionCardProps> = (props) => {
   return (
      <Paper
         onClick={props.onClick}
         sx={{
            ...styles.root,
            ...(props.onClick && styles.clickable),
         }}
      >
         <Grid container spacing={2}>
            {props.number && (
               <Grid xs={2} item>
                  <Box sx={styles.numberWrapper}>
                     <Typography color="text.secondary" sx={styles.number}>
                        {props.number}
                     </Typography>
                  </Box>
               </Grid>
            )}
            <Grid xs={props.number ? 10 : 12} item>
               <Box sx={styles.detailsWrapper}>
                  <Typography
                     gutterBottom={Boolean(props.description)}
                     variant="subtitle1"
                  >
                     {props.title}
                  </Typography>
                  {props.description && (
                     <Typography variant="body1" color="text.secondary">
                        {props.description}
                     </Typography>
                  )}
                  {props.actionButtonProps && (
                     <Button {...props.actionButtonProps} />
                  )}
               </Box>
            </Grid>
         </Grid>
      </Paper>
   )
}

export default OptionCard
