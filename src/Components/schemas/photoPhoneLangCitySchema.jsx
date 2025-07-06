import * as yup from "yup";

export const photoPhoneLangCitySchema=yup.object({
    phone:yup.number().required("⚠️Please Enter Your Phone Number."),
    city:yup.string().min(3).max(25).required("⚠️Please Enter Your City."),
    language:yup.string().min(3).max(30).required("⚠️Please Enter Your language."),
    });