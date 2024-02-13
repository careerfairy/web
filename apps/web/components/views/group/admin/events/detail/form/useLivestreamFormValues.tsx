import { useFormikContext } from "formik"
import { LivestreamFormValues } from "./types"

export const useLivestreamFormValues = () =>
   useFormikContext<LivestreamFormValues>()
