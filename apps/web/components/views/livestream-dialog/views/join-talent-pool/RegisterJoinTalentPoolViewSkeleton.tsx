import { Skeleton } from "@mui/material"
import RegisterDataConsentViewSkeleton from "../data-consent/RegisterDataConsentViewSkeleton"

const RegisterJoinTalentPoolViewSkeleton = () => {
   return <RegisterDataConsentViewSkeleton body={<BodySkeleton />} />
}

const BodySkeleton = () => {
   return <Skeleton width="90%" height={120} />
}

export default RegisterJoinTalentPoolViewSkeleton
