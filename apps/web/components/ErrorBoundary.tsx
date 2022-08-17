import React, { ReactNode, Suspense } from "react"
import * as Sentry from "@sentry/nextjs"
import ErrorContext from "../context/error/ErrorContext"

type Props = {
   message?: string
   hide?: boolean // don't show anything in case of error
   detailedDescription?: boolean
   showToastNotification?: boolean
}

type State = {
   hasError: boolean
}

/**
 * Custom React Error Boundary
 *
 * Useful to contain certain UI errors, when not in use
 * NextJS will render a full page stating a client side error
 */
export default class ErrorBoundary extends React.Component<Props, State> {
   static contextType = ErrorContext

   static defaultProps = {
      detailedDescription: true,
      hide: false,
      message: "Oops, there was an error loading this data!",
      showToastNotification: true,
   }

   constructor(props) {
      super(props)

      this.state = {
         hasError: false,
      }
   }

   static getDerivedStateFromError(error) {
      return { hasError: true }
   }

   componentDidCatch(error, errorInfo) {
      console.error({ error, errorInfo })
      Sentry.captureException(error, { extra: { errorInfo: errorInfo } })

      if (this.props.showToastNotification) {
         this.context.setGeneralError(this.props.message)
      }
   }

   render() {
      // Check if the error is thrown
      if (this.state.hasError) {
         if (this.props.hide) {
            return <div />
         }

         if (this.props.detailedDescription === false) {
            return <div>{this.props.message}</div>
         }

         // fallback UI
         return (
            <div>
               <h2>{this.props.message}</h2>
               <h3>We{"'"}ve been informed about this error, sorry :(.</h3>
            </div>
         )
      }

      // Return children components in case of no error
      return this.props.children
   }
}

interface SuspenseWithBoundaryProps extends Props {
   fallback?: ReactNode
   children: ReactNode
}

/**
 * ErrorBoundary + Suspense
 *
 * @param props
 * @constructor
 */
export const SuspenseWithBoundary = (props: SuspenseWithBoundaryProps) => {
   return (
      <ErrorBoundary {...props}>
         <Suspense fallback={props.fallback ?? "Loading.."}>
            {props.children}
         </Suspense>
      </ErrorBoundary>
   )
}
