import React, { FC } from "react"
import { ButtonProps, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Router from "next/router"
import useDictValues from "../../../../../custom-hook/useDictValues"

const styles = sxStyles({
   root: {
      py: 2,
      position: "relative",
   },
   clickable: {
      cursor: "pointer",
      transition: (theme) =>
         theme.transitions.create(["border", "background-color"]),
      px: 2,
      borderRadius: 1,
      border: (theme) => `1px solid ${theme.palette.grey["600"]}`,
      "&:hover, &:focus": {
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

type StepId = "networkError" | "refresh"

type Props = {
   stepIds: StepId[]
}
const StepsView = ({ stepIds }: Props) => {
   const steps = useDictValues(stepIds, stepsDict)

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
      <Box
         onClick={props.onClick}
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
                     {props.title && (
                        <Typography
                           gutterBottom={Boolean(props.description)}
                           sx={styles.title}
                           variant="h5"
                        >
                           {props.title}
                        </Typography>
                     )}
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
      </Box>
   )
}

const stepsDict: Record<StepId, StepCardProps> = {
   networkError: {
      title: "Change Network",
      description:
         "Try disconnecting from any VPN, switching to another " +
         "network or use a mobile hotspot. and click refresh once done.",
      actionButtonProps: {
         onClick: Router.reload,
         children: "Refresh",
         variant: "contained",
         color: "secondary",
      },
   },
   refresh: {
      description: "Sometimes a simple refresh might resolve the issue.",
      actionButtonProps: {
         children: "Refresh",
         onClick: Router.reload,
         variant: "contained",
         color: "secondary",
      },
      title: "Try Refreshing",
   },
}

export default StepsView
