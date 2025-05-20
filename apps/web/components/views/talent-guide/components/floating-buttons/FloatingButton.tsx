import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { Fragment } from "react"
import { useIsLoadingNextStep } from "store/selectors/talentGuideSelectors"
import { combineStyles, sxStyles } from "types/commonTypes"

const PADDING = 15

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
      zIndex: (theme) => theme.zIndex.appBar + 2,
   },
   buttonOffset: {
      height: {
         xs: 78 + PADDING,
         md: 88 + PADDING,
      },
   },
})

type Props = LoadingButtonProps & {
   href?: string
}

export const FloatingButton = ({ children, sx, ...props }: Props) => {
   const isMobile = useIsMobile()
   const isLoading = useIsLoadingNextStep()

   const ButtonWrapper = props.href ? Link : Fragment
   const ButtonWrapperProps = props.href ? { href: props.href } : {}

   return (
      <Fragment>
         <Box sx={styles.buttonOffset} />
         <ButtonWrapper {...ButtonWrapperProps}>
            <LoadingButton
               translate="no"
               size="large"
               fullWidth={isMobile}
               sx={combineStyles(styles.button, sx)}
               {...props}
               loading={Boolean(isLoading || props.loading)}
            >
               {children}
            </LoadingButton>
         </ButtonWrapper>
      </Fragment>
   )
}
