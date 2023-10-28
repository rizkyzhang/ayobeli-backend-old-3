import { ZodTypeAny, z } from "zod";

export const zodValidateJSON = (
  schema: ZodTypeAny,
  isOptional: boolean = false
) => {
  const customSchema = z
    .custom<string>((val) => {
      try {
        JSON.parse(String(val));
        return true;
      } catch (error) {
        return false;
      }
    }, "invalid json")
    .transform((val) => JSON.parse(val))
    .pipe(schema);

  if (isOptional) {
    return z.string().pipe(customSchema).optional();
  }

  return z.string().pipe(customSchema);
};
