import { Link, Typography } from "@mui/material"

type Props = {
   href?: string
   // onClick?: () => void
}

export const SeeAllLink = ({ href }: Props) => {
   // const router = useRouter()

   // const handleClick = () => {
   //     if (href) {
   //         router.push(href)
   //     }
   //     onClick?.()
   // }

   return (
      <Link href={href}>
         <Typography
            variant="xsmall"
            color="neutral.600"
            sx={{ textDecoration: "underline", fontWeight: 400 }}
         >
            See all
         </Typography>
      </Link>
   )
}
