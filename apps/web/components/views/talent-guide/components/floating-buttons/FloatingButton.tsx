import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Fragment } from "react"
import { useIsLoadingNextStep } from "store/selectors/talentGuideSelectors"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   button: {
      position: "fixed",
      bottom: {
         xs: 30,
         md: 40,
      },
      left: "50%",
      transform: "translateX(-50%)",
      px: 2,
      display: "flex",
      justifyContent: "center",
      width: 343,
      zIndex: 3,
   },
   buttonOffset: {
      height: {
         xs: 78,
         md: 88,
      },
   },
})

export const FloatingButton = ({
   children,
   sx,
   ...props
}: LoadingButtonProps) => {
   const isMobile = useIsMobile()
   const isLoading = useIsLoadingNextStep()

   return (
      <Fragment>
         <Box sx={styles.buttonOffset} />
         <LoadingButton
            size="large"
            fullWidth={isMobile}
            sx={combineStyles(styles.button, sx)}
            {...props}
            loading={isLoading || props.loading}
         >
            {children}
         </LoadingButton>
      </Fragment>
   )
}
