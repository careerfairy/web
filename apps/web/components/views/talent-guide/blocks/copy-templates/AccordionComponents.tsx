import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
   Accordion,
   AccordionActions,
   AccordionActionsProps,
   AccordionProps,
   Box,
   BoxProps,
   Button,
} from "@mui/material"
import AccordionDetails, {
   AccordionDetailsProps,
} from "@mui/material/AccordionDetails"
import AccordionSummary, {
   AccordionSummaryProps,
} from "@mui/material/AccordionSummary"
import { copyStringToClipboard } from "components/helperFunctions/HelperFunctions"
import { AnimatePresence } from "framer-motion"
import React, { Children, useState } from "react"
import { CheckCircle, Copy } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { Animation } from "./Animations"
import { useTemporaryState } from "./useTemporaryActiveState"

const ICON_SIZE = 14

const accordionStyles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
   },
   cardBase: (theme) => ({
      "&::before": {
         content: "none",
      },
      borderRadius: "20px !important",
      paddingY: "8px",
      background: theme.palette.common.white,
      "*": {
         color: (theme) => `${theme.palette.neutral["700"]}`,
         fontSize: "16px !important",
      },
   }),
   cardInactive: (theme) => ({
      border: `1.5px solid ${theme.brand.white["500"]}`,
      boxShadow: "0px 0px 0px 0px rgba(0, 189, 64, 0.25)",
   }),
   cardActive: (theme) => ({
      border: `1.5px solid ${theme.brand.success.main}`,
      boxShadow: "0px 0px 40px 0px rgba(0, 189, 64, 0.10)",
   }),
   summary: {
      paddingX: "12px",
      minHeight: "unset !important",
      maxHeight: "unset !important",
      "& .MuiAccordionSummary-content": {
         margin: "0px",
      },
   },
   details: {
      padding: "12px",
      paddingBottom: "0px",
   },
   actions: {
      padding: "12px",
      paddingTop: "4px",
      paddingBottom: "4px",
   },
})

const copyButtonStyles = sxStyles({
   root: {
      height: "36px",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "18px",
      fontWeight: 400,
      "& .MuiButton-icon": {
         margin: "0 !important",
         "& svg": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${ICON_SIZE}px`,
            height: `${ICON_SIZE}px`,
         },
      },
      "*": {
         fontSize: "14px !important",
      },
   },
   inactive: (theme) => ({
      backgroundColor: "white !important",
      border: `1px solid ${theme.palette.neutral["200"]} !important`,
      "*": {
         color: `${theme.palette.neutral[500]}`,
      },
   }),
   active: (theme) => ({
      backgroundColor: `${theme.brand.success["700"]} !important`,
      border: `1px solid ${theme.palette.success["700"]} !important`,
      "*": {
         color: theme.brand.white["50"],
      },
   }),
   wrapper: {
      position: "relative",
      width: `${ICON_SIZE}px !important`,
      height: `${ICON_SIZE}px !important`,
      margin: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
})

export const CopyAccordion = (props: BoxProps) => {
   const [expanded, setExpanded] = useState<string>(undefined)

   const handleChange =
      (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
         setExpanded(isExpanded ? panel : undefined)
      }

   return (
      <Box {...props} sx={accordionStyles.root}>
         {Children.map(props.children, (child: React.ReactElement, index) => {
            return React.cloneElement(child, {
               ...child.props,
               key: index,
               expanded: expanded === `panel${index}`,
               onChange: handleChange(`panel${index}`),
            })
         })}
      </Box>
   )
}

type AccordionCardProps = AccordionProps & {
   isActive?: boolean
}

const AccordionCard = ({ isActive = false, ...props }: AccordionCardProps) => (
   <Animation.Glowing isActive={isActive}>
      <Accordion
         {...props}
         sx={[
            accordionStyles.cardBase,
            isActive
               ? accordionStyles.cardActive
               : accordionStyles.cardInactive,
         ]}
      />
   </Animation.Glowing>
)

const Summary = (props: AccordionSummaryProps) => {
   return (
      <AccordionSummary
         expandIcon={<ExpandMoreIcon />}
         {...props}
         sx={accordionStyles.summary}
      />
   )
}

const Details = (props: AccordionDetailsProps) => (
   <AccordionDetails {...props} sx={accordionStyles.details} />
)

const Actions = (props: AccordionActionsProps) => (
   <AccordionActions {...props} sx={accordionStyles.actions} />
)

type CopyActionProps = {
   clipboardContent: string
   onClickCallback: () => void
}

const CopyAction = ({ clipboardContent, onClickCallback }: CopyActionProps) => {
   const { isActive, setIsActive } = useTemporaryState()

   return (
      <Actions>
         <Button
            variant={isActive ? "contained" : "outlined"}
            onClick={() => {
               copyStringToClipboard(clipboardContent)
               setIsActive(true)
               onClickCallback?.()
            }}
            endIcon={
               <Box sx={copyButtonStyles.wrapper}>
                  <AnimatePresence initial={false} mode="wait">
                     {isActive ? (
                        <Animation.SlideRight>
                           <CheckCircle />
                        </Animation.SlideRight>
                     ) : (
                        <Animation.SlideLeft>
                           <Copy />
                        </Animation.SlideLeft>
                     )}
                  </AnimatePresence>
               </Box>
            }
            sx={[
               copyButtonStyles.root,
               isActive ? copyButtonStyles.active : copyButtonStyles.inactive,
            ]}
         >
            <Animation.Growing>
               {isActive ? "Template copied" : "Copy template"}
            </Animation.Growing>
         </Button>
      </Actions>
   )
}

CopyAccordion.Card = AccordionCard
CopyAccordion.Summary = Summary
CopyAccordion.Details = Details
CopyAccordion.Actions = Actions
CopyAccordion.CopyButton = CopyAction
