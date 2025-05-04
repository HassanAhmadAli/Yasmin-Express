import Joi from "joi";

export default Joi.string().min(8).required().messages({
  "string.pattern.base":
    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
});
