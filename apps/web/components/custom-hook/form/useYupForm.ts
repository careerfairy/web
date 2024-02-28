import { useForm, UseFormProps } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

/**
 * Custom hook for form handling with Yup schema validation.
 *
 * This hook simplifies integrating Yup schema validation with react-hook-form by automatically
 * resolving the schema provided. It returns all the necessary properties and methods from useForm
 * to manage form state, handle submissions, and validate user input according to the Yup schema.
 *
 * @param {Object} props - The properties to configure the hook.
 * @param {yup.AnyObjectSchema} props.schema - The Yup schema object for validation.
 * Other properties from UseFormProps can be passed to customize the react-hook-form behavior.
 *
 * @returns The useForm hook properties and methods, enhanced with Yup schema validation.
 *
 * @example
 * const schema = yup.object({
 *    name: yup.string().required(),
 *    age: yup.number().positive().integer().required(),
 *    gender: yup.string().oneOf(['male', 'female']).required(),
 * });
 *
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useYupForm({
      schema,
      defaultValues: {
         name: "",
         age: 0,
         gender: "male",
      },
   })
 *
 * Note: Use `yup.object({})` instead of `yup.object().shape({})` for schema definition due to type inference limitations,
 * though both validate identically.
 */
export const useYupForm = <TSchema extends yup.AnyObjectSchema>(
   props: Omit<UseFormProps<yup.InferType<TSchema>>, "resolver"> & {
      schema: TSchema
   }
) => {
   return useForm<yup.InferType<TSchema>>({
      ...props,
      resolver: yupResolver(props.schema),
   })
}
