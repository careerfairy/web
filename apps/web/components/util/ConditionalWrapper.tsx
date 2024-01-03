/**
 * Conditionally renders a set of components based on input boolean condition @param condition.
 * @param input Object containing rendering options, where components specified in field condition are rendered following
 * a ternary evaluation, with @param input.trutyChildren being rendered when @param input.condition is of truthful value, otherwise
 * the value to be rendered is @param input.falsyChildren .
 * @returns Any type, dictated by truthy or falsy children.
 */
const ConditionalWrapper = (input: ConditionalWrapperType) =>
   input.condition ? input.truthyChildren : input.falsyChidren

export type ConditionalWrapperType = {
   condition?: boolean
   truthyChildren: any
   falsyChidren: any
}
export default ConditionalWrapper
