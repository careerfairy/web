import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Stack,
   Typography,
} from "@mui/material"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"
import { ChevronDown as ArrowDownIcon } from "react-feather"
import { FC } from "react"

const styles = sxStyles({
   accordionWrapper: {
      minHeight: "28px",

      "&.MuiAccordion-root": {
         boxShadow: "none",
         position: "unset",
      },
   },
   summary: {
      minHeight: "24px !important",
      p: 0,

      "&$expanded": {
         margin: 0,
      },

      "& .MuiAccordionSummary-content": {
         m: "0 !important",
      },
   },
   accordionList: {
      mt: 1,
      borderRadius: "8px",
      background: "#F3F3F5",
   },
})

type Props = {
   onCloseDrawer: () => void
}

const B2CDrawer: FC<Props> = ({ onCloseDrawer }) => {
   return (
      <Stack spacing={2}>
         <Accordion sx={styles.accordionWrapper}>
            <AccordionSummary
               expandIcon={<ArrowDownIcon />}
               sx={styles.summary}
            >
               <Typography variant="brandedBody" color={"neutral.700"}>
                  Product
               </Typography>
            </AccordionSummary>

            <AccordionDetails sx={styles.accordionList}>
               <Stack spacing={2}>
                  <Link
                     href={"/employers/employee-videos"}
                     onClick={onCloseDrawer}
                  >
                     <Typography variant="brandedBody" color={"neutral.700"}>
                        Employee videos
                     </Typography>
                  </Link>

                  <Link
                     href={"/employers/jobs-live-streams"}
                     onClick={onCloseDrawer}
                  >
                     <Typography variant="brandedBody" color={"neutral.700"}>
                        Jobs live streams
                     </Typography>
                  </Link>
               </Stack>
            </AccordionDetails>
         </Accordion>

         <Accordion sx={styles.accordionWrapper}>
            <AccordionSummary
               expandIcon={<ArrowDownIcon />}
               sx={styles.summary}
            >
               <Typography variant="brandedBody" color={"neutral.700"}>
                  Resources
               </Typography>
            </AccordionSummary>

            <AccordionDetails sx={styles.accordionList}>
               <Stack spacing={2}>
                  <Link
                     href={"/employers/academic-calendar"}
                     onClick={onCloseDrawer}
                  >
                     <Typography variant="brandedBody" color={"neutral.700"}>
                        Academic calendar
                     </Typography>
                  </Link>

                  <Link
                     href={"/employers/case-studies"}
                     onClick={onCloseDrawer}
                  >
                     <Typography variant="brandedBody" color={"neutral.700"}>
                        Case studies
                     </Typography>
                  </Link>
               </Stack>
            </AccordionDetails>
         </Accordion>

         <Link href={"/employers/about"} onClick={onCloseDrawer}>
            <Typography variant="brandedBody" color={"neutral.700"}>
               About us
            </Typography>
         </Link>

         <Link href={"/"} onClick={onCloseDrawer}>
            <Typography variant="brandedBody" color={"neutral.700"}>
               For students
            </Typography>
         </Link>
      </Stack>
   )
}

export default B2CDrawer
