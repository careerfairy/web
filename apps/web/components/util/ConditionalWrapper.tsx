/**
 * Conditionally renders a set of components based on input boolean condition @param condition.
 * @param input Object containing rendering options, where components specified in field condition are rendered following
 * a ternary evaluation, with @param input.children being rendered when @param input.condition is of truthful value, otherwise
 * the value to be rendered is @param input.fallback .
 * @returns React.ReactNode depending on the boolean value of condition.
 */
const ConditionalWrapper = (input: ConditionalWrapperType) =>
   input.condition ? input.children : input.fallback

export type ConditionalWrapperType = {
   condition?: boolean
   children: React.ReactNode
   fallback?: React.ReactNode
}
export default ConditionalWrapper
