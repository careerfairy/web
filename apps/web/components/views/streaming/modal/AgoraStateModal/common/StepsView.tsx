import React, { ComponentProps, FC } from "react"
import { ButtonProps, Card, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"

const styles = sxStyles({
   root: {
      py: 2,
      position: "relative",
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
   title: {
      fontWeight: 500,
   },
})

type Props = {
   steps: ComponentProps<typeof StepCard>[]
}
const StepsView = ({ steps }: Props) => {
   return (
      <Stack spacing={1.5}>
         {steps.map((resource) => (
            <StepCard {...resource} key={resource.title} />
         ))}
      </Stack>
   )
}

export interface StepCardProps {
   title: string
   description?: string
   number?: number | string
   onClick?: () => void
   actionButtonProps?: ButtonProps
}

export const StepCard: FC<StepCardProps> = (props) => {
   return (
      <Card
         onClick={props.onClick}
         elevation={0}
         sx={{
            ...styles.root,
            ...(props.onClick && styles.clickable),
         }}
      >
         <Grid container spacing={2}>
            {props.number && (
               <Grid xs={1} item>
                  <Box sx={styles.numberWrapper}>
                     <Typography color="text.secondary" sx={styles.number}>
                        {props.number}
                     </Typography>
                  </Box>
               </Grid>
            )}
            <Grid xs={props.number ? 11 : 12} item>
               <Stack
                  direction={{
                     xs: "column",
                     sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={1}
               >
                  <Box>
                     <Typography
                        gutterBottom={Boolean(props.description)}
                        sx={styles.title}
                        variant="h5"
                     >
                        {props.title}
                     </Typography>
                     {props.description && (
                        <Typography variant="body1">
                           {props.description}
                        </Typography>
                     )}
                  </Box>
                  {props.actionButtonProps && (
                     <Box
                        sx={{
                           alignSelf: "center",
                           p: 1,
                        }}
                     >
                        <Button {...props.actionButtonProps} />
                     </Box>
                  )}
               </Stack>
            </Grid>
         </Grid>
      </Card>
   )
}

export default StepsView
