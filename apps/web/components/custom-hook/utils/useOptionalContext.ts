import { Context, useContext } from "react"

/**
 * Generic hook to optionally use a context value or a provided value.
 *
 * @param context - The React context to use if no value is provided.
 * @param value - An optional value. If provided, this value is used instead of the context value.
 * @returns The resolved value from either the provided value or the context.
 */
export const useOptionalContext = <T>(
   context: Context<T | null>,
   value?: T | null
): T | null => {
   const valueFromContext = useContext(context)
   return value || valueFromContext
}
