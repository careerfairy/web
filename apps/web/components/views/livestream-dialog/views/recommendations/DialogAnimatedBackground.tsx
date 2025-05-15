import { Box, BoxProps, keyframes } from "@mui/material"
import { styled } from "@mui/material/styles"
import { createContext, ReactNode, useContext, useMemo } from "react"
import { combineStyles } from "types/commonTypes"

type AnimatedBackgroundContextType = {
   showAnimatedBackground: boolean
   expanded: boolean
}

type AnimatedBackgroundProviderProps = {
   children: ReactNode
   showAnimatedBackground: boolean
   expanded: boolean
}

const AnimatedBackgroundContext = createContext<
   AnimatedBackgroundContextType | undefined
>(undefined)

// Keyframes for the rotation animation
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const PaperRoot = styled(Box)(({ theme }) => ({
   transition: theme.transitions.create("max-width"),
}))

const Root = styled(Box)({
   position: "absolute",
   inset: 0,
})

// Styled container for the animation
const AnimatedContainer = styled(Box)(({ theme }) => ({
   position: "relative",
   width: "100%",
   height: "100%",
   overflow: "hidden",
   backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#FDFDFD",
}))

// Styled element for the blur effect container
const BlurContainer = styled(Box)({
   position: "absolute",
   top: "-50%",
   left: "-50%",
   width: "200%",
   height: "200%",
   animation: `${rotate} 6s linear infinite`,
   filter: "blur(225.8px)",
})

// Create a base Circle component with perfect aspect ratio
const Circle = styled(Box)({
   position: "absolute",
   aspectRatio: "1/1",
   borderRadius: "50%",
   width: 525,
})

// Styled elements for each colored circle
const PurpleCircle = styled(Circle)(({ theme }) => ({
   backgroundColor: theme.brand.purple[500],
   top: "30%",
   left: "33%",
}))

const TealCircle = styled(Circle)(({ theme }) => ({
   backgroundColor: theme.brand.tq[100],
   top: "15%",
   right: "27%",
}))

const BlueCircle = styled(Circle)(({ theme }) => ({
   backgroundColor: theme.brand.info[200],
   bottom: "8%",
   left: "39%",
}))

const PinkCircle = styled(Circle)(({ theme }) => ({
   backgroundColor: theme.brand.error[50],
   bottom: "25%",
   right: "45%",
}))

export const useAnimatedBackground = (): AnimatedBackgroundContextType => {
   const context = useContext(AnimatedBackgroundContext)
   if (context === undefined) {
      throw new Error(
         "useAnimatedBackground must be used within an AnimatedBackgroundProvider"
      )
   }
   return context
}

export const AnimatedBackgroundProvider = ({
   showAnimatedBackground,
   expanded,
   children,
}: AnimatedBackgroundProviderProps) => {
   const value = useMemo(
      () => ({ showAnimatedBackground, expanded }),
      [showAnimatedBackground, expanded]
   )
   return (
      <AnimatedBackgroundContext.Provider value={value}>
         {children}
      </AnimatedBackgroundContext.Provider>
   )
}

export const DialogAnimatedBackground = ({
   children,
   sx,
   ...props
}: BoxProps) => {
   const { showAnimatedBackground, expanded } = useAnimatedBackground()
   return (
      <PaperRoot
         id="dialog-animated-background"
         {...props}
         sx={combineStyles(sx, [
            expanded && {
               maxWidth: "1373px !important",
            },
         ])}
      >
         <Root>
            <AnimatedContainer>
               {Boolean(showAnimatedBackground) && (
                  <BlurContainer>
                     <BlueCircle />
                     <PurpleCircle />
                     <PinkCircle />
                     <TealCircle />
                  </BlurContainer>
               )}
            </AnimatedContainer>
         </Root>
         {children}
      </PaperRoot>
   )
}
