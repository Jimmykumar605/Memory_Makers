import * as yup from "yup";

export const signUPSchema=yup.object({
name:yup.string().min(2).max(25).required("⚠️Please Enter your name"),
email:yup.string().email().required("⚠️Please Enter your Email"),
password:yup.string().min(6).required("⚠️Please Enter your Password"),
confirm_password:yup.string().required().oneOf([yup.ref('password'),null],"⚠️Password must match"),
});