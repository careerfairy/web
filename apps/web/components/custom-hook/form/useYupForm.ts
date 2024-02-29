import { useForm, UseFormProps } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

/**
 * A custom hook that integrates Yup schema validation with react-hook-form.
 * It returns useForm properties and methods, enhanced for schema validation.
 *
 * @param {Object} props - Configuration properties.
 * @param {yup.AnyObjectSchema} props.schema - Yup validation schema.
 * Additional UseFormProps can be included for react-hook-form customization.
 *
 * @returns Enhanced useForm hook properties and methods for schema validation.
 *
 * @example
 * const schema = yup.object({
 *    name: yup.string().required(),
 *    age: yup.number().positive().integer().required(),
 *    gender: yup.string().oneOf(['male', 'female']).required(),
 * });
 *
 * const { register, handleSubmit, formState: { errors } } = useYupForm({
 *    schema,
 *    defaultValues: { name: "", age: 0, gender: "male" },
 * });
 *
 * Note: Prefer `yup.object({})` over `yup.object().shape({})` for schema definition to avoid type inference issues.
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
