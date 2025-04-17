import { Box, keyframes } from "@mui/material"
import { styled } from "@mui/material/styles"

// Keyframes for the rotation animation
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

// Styled container for the animation
const AnimatedContainer = styled(Box)(({ theme }) => ({
   position: "relative",
   width: "100%",
   height: "100%",
   overflow: "hidden",
   backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
   borderRadius: theme.shape.borderRadius,
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

// Styled elements for each colored circle
const PurpleCircle = styled(Box)(({ theme }) => ({
   position: "absolute",
   width: "40%",
   height: "40%",
   borderRadius: "50%",
   backgroundColor: theme.brand.purple[500],
   top: "30%",
   left: "20%",
}))

const TealCircle = styled(Box)(({ theme }) => ({
   position: "absolute",
   width: "30%",
   height: "30%",
   borderRadius: "50%",
   backgroundColor: theme.brand.tq[100],
   top: "20%",
   right: "30%",
}))

const BlueCircle = styled(Box)(({ theme }) => ({
   position: "absolute",
   width: "35%",
   height: "35%",
   borderRadius: "50%",
   backgroundColor: theme.brand.info[200],
   bottom: "20%",
   left: "30%",
}))

const PinkCircle = styled(Box)(({ theme }) => ({
   position: "absolute",
   width: "25%",
   height: "25%",
   borderRadius: "50%",
   backgroundColor: theme.brand.error[50],
   bottom: "30%",
   right: "20%",
}))

export const AnimatedBackground = () => {
   return (
      <AnimatedContainer>
         <BlurContainer>
            <PurpleCircle />
            <TealCircle />
            <BlueCircle />
            <PinkCircle />
         </BlurContainer>
      </AnimatedContainer>
   )
}
