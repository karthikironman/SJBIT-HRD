import Joi from "joi";

const userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required()
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const validateUser = (req, res, next) => {
    const {error} = userSchema.validate(req.body);
    if(error) return res.status(400).json({ status: 400, message: error.details[0].message });
    next();
};

export const validateRegister = (req, res, next) => {
    const {error} = registerSchema.validate(req.body);
    if(error) return res.status(400).json({ status: 400, message: error.details[0].message });
    
    // Brand Domain Validation
    const domain = process.env.BRAND_DOMAIN;
    if (domain && !req.body.email.endsWith(`@${domain}`)) {
         return res.status(400).json({ status: 400, message: `Email must belong to ${domain}`});
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const {error} = loginSchema.validate(req.body);
    if(error) return res.status(400).json({ status: 400, message: error.details[0].message });
    next();
};