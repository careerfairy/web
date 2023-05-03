import { Pagination } from "@mui/material"
import React, { useCallback, useEffect } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import useTimeOut from "../../../custom-hook/useTimeOut"
import { PaginationRenderItemParams } from "@mui/material/Pagination/Pagination"
import PaginationItem from "@mui/material/PaginationItem"
import { alpha } from "@mui/material/styles"

const styles = sxStyles({
   stepper: (theme) => ({
      borderRadius: "50%",
      mr: 2,
      backgroundColor: alpha(theme.palette.common.white, 0.2),
      cursor: "pointer",
      "&:hover": {
         backgroundColor: alpha(theme.palette.common.white, 0.5),
      },
      width: theme.spacing(2),
      height: theme.spacing(2),
      minWidth: theme.spacing(2),
      minHeight: theme.spacing(2),
   }),
   activeStepper: {
      backgroundColor: "white !important",
   },
})

const ContentCarouselPagination = ({
   activeStep,
   count,
   handleChange,
   delay,
}) => {
   const { startCountDown, progress } = useTimeOut({
      delay: delay,
   })

   useEffect(() => {
      startCountDown()
   }, [activeStep])

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
         page={activeStep + 1}
         hideNextButton={true}
         hidePrevButton={true}
         count={count}
         renderItem={renderItem}
      />
   )
}

export default ContentCarouselPagination
