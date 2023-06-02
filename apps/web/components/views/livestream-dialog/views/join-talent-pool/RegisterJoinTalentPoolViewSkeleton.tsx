import { Skeleton } from "@mui/material"
import RegisterDataConsentViewSkeleton from "../data-consent/RegisterDataConsentViewSkeleton"

const RegisterJoinTalentPoolViewSkeleton = () => {
   return <RegisterDataConsentViewSkeleton body={<BodySkeleton />} />
}

const BodySkeleton = () => {
   return <Skeleton width="100%" height={100} />
}

export default RegisterJoinTalentPoolViewSkeleton
