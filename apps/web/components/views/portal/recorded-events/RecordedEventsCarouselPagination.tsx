import { LinearProgress, Pagination } from "@mui/material"
import React, { useEffect } from "react"
import { StylesProps } from "../../../../types/commonTypes"
import useTimeOut from "../../../custom-hook/useTimeOut"

const styles: StylesProps = {
   stepper: {
      width: "35px",
      height: "5px",
      marginRight: "20px",
      borderRadius: "30px",
      backgroundColor: "#9999B1",
      cursor: "pointer",
   },
   activeStepper: {
      cursor: "unset",
   },
}
const RecordedEventsCarouselPagination = ({
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

   return (
      <Pagination
         defaultPage={activeStep}
         page={activeStep + 1}
         hideNextButton={true}
         hidePrevButton={true}
         count={count}
         renderItem={(item) => (
            <LinearProgress
               sx={{
                  ...styles.stepper,
                  ...(item.page - 1 === activeStep
                     ? styles.activeStepper
                     : null),
               }}
               variant="determinate"
               color="info"
               onClick={() => handleChange(item.page - 1)}
               value={item.page - 1 === activeStep ? progress : 0}
            />
         )}
      />
   )
}

export default RecordedEventsCarouselPagination
