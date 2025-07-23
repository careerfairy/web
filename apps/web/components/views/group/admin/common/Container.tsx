import { Container, ContainerProps } from "@mui/material"

export const AdminContainer = ({
   children,
   ...props
}: Omit<ContainerProps, "maxWidth">) => {
   return (
      <Container maxWidth="xl" {...props}>
         {children}
      </Container>
   )
}
