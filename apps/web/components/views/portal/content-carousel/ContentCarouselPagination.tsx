import Pagination, { paginationClasses } from "@mui/material/Pagination"
import { PaginationRenderItemParams } from "@mui/material/Pagination/Pagination"
import PaginationItem from "@mui/material/PaginationItem"
import { alpha } from "@mui/material/styles"
import { useCallback, useEffect } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import useTimeOut from "../../../custom-hook/useTimeOut"

const styles = sxStyles({
   root: {
      [`& .${paginationClasses.ul}`]: {
         flexWrap: "nowrap",
      },
   },
   stepper: (theme) => ({
      borderRadius: "50%",
      mr: 1.5,
      backgroundColor: alpha("#B5B5B5", 0.3),

      cursor: "pointer",
      "&:hover": {
         backgroundColor: alpha("#B5B5B5", 0.5),
      },
      width: theme.spacing(1.5),
      height: theme.spacing(1.5),
      minWidth: theme.spacing(1.5),
      minHeight: theme.spacing(1.5),
      border: "none",
   }),
   activeStepper: {
      backgroundColor: "#8D8D8D !important",
   },
})

const ContentCarouselPagination = ({
   activeStep,
   count,
   handleChange,
   delay,
}) => {
   const { startCountDown } = useTimeOut({
      delay: delay,
   })

   useEffect(() => {
      startCountDown()
   }, [activeStep, startCountDown])

   const renderItem = useCallback(
      (item: PaginationRenderItemParams) => {
         const stepIsActive = item.page - 1 === activeStep

         return (
            <PaginationItem
               {...item}
               variant="outlined"
               sx={[styles.stepper, stepIsActive && styles.activeStepper]}
               page={undefined}
               size="small"
               onClick={() => handleChange(item.page - 1)}
            />
         )
      },
      [activeStep, handleChange]
   )

   return (
      <Pagination
         defaultPage={activeStep}
         sx={styles.root}
         page={activeStep + 1}
         hideNextButton={true}
         hidePrevButton={true}
         count={count}
         renderItem={renderItem}
      />
   )
}

export default ContentCarouselPagination
