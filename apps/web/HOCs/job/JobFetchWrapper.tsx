import { FC, ReactNode } from "react"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import useCustomJob from "../../components/custom-hook/useCustomJob"

/**
 * Props for JobFetcher component.
 * @typedef {Object} JobFetcherProps
 * @property {string} groupId - The ID of the group.
 * @property {string} [jobId] - The ID of the selected Job.
 * @property {(job: CustomJob | null) => ReactNode} children - A function that returns a ReactNode, given a Job.
 */
type JobFetcherProps = {
   jobId?: string
   children: (job: CustomJob | null) => ReactNode
}

/**
 * Fetches the Job using the provided group and Job ID.
 * @param {JobFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const JobFetcher: FC<JobFetcherProps> = ({ jobId, children }) => {
   const job = useCustomJob(jobId)
   return <>{children(job)}</>
}

/**
 * Props for JobFetchWrapper component.
 * @typedef {Object} WrapperProps
 * @property {boolean} shouldFetch - Indicates whether the Job data should be fetched.
 */
type WrapperProps = {
   shouldFetch: boolean
}

/**
 * A Higher Order Component (HOC) that wraps around the JobFetcher component and conditionally fetches the Job data.
 * This component provides a level of abstraction to handle conditional rendering based on the `shouldFetch` prop.
 * If `shouldFetch` is true, it will render the JobFetcher component which in turn fetches data using the reactfire-based hook.
 * Otherwise, it simply renders children with null data, ensuring the hook is not called with undefined arguments or else it will throw an error.
 * @param {WrapperProps & JobFetcherProps} props - The props for the component.
 * @returns {ReactNode} - The child components.
 */
const JobFetchWrapper: FC<WrapperProps & JobFetcherProps> = ({
   shouldFetch,
   jobId,
   children,
}) => {
   if (shouldFetch) {
      return <JobFetcher jobId={jobId}>{children}</JobFetcher>
   } else {
      return <>{children(null)}</>
   }
}

export default JobFetchWrapper
