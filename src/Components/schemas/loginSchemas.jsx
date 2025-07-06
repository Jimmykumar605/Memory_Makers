import * as Yup from "yup";

export const loginSchemas =Yup.object({
    name:Yup.string()
    .required("Please enter the required field")
    .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
    password:Yup.string().min(6).required("Please enter your password"),
    remember: Yup.boolean().default(false),
});