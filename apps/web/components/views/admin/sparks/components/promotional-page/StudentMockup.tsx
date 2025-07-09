import { Box, styled } from "@mui/material"
import { ComponentProps } from "react"
import { StudentProfileCard } from "./StudentProfileCard"

const Root = styled(Box)({
   backgroundColor: "#E6F3FB",
   borderRadius: "4px",
   height: "158px",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   position: "relative",
   overflow: "hidden",
})

const StudentProfileCardContainer = styled(Box)({
   top: "30px",
   position: "relative",
   width: "100%",
   maxWidth: "280px",
   height: "118px",
   margin: "0 auto",
})

const studentProfiles: ComponentProps<typeof StudentProfileCard>[] = [
   {
      name: "Anna Schmidt",
      subject: "Finance",
      imageSrc: "/student-avatars/anna-schmidt-avatar.png",
      position: { left: "5%", top: "5px", transform: "rotate(-2.274deg)" },
      zIndex: 1,
   },
   {
      name: "Lukas Müller",
      subject: "Business",
      imageSrc: "/student-avatars/lukas-muller-avatar.png",
      position: { left: "50%", top: "-1px", transform: "translateX(-50%)" },
      zIndex: 3,
   },
   {
      name: "Clara Müller",
      subject: "Computer science",
      imageSrc: "/student-avatars/clara-muller-avatar.png",
      position: { right: "5%", top: "5px", transform: "rotate(2.27deg)" },
      zIndex: 2,
   },
]

export const StudentMockup = () => {
   return (
      <Root id="student-mockup">
         <StudentProfileCardContainer>
            {studentProfiles.map((profile) => (
               <StudentProfileCard key={profile.name} {...profile} />
            ))}
         </StudentProfileCardContainer>
      </Root>
   )
}
