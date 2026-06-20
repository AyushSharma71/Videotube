import {body,validationResult} from "express-validator";

 function validation(req,res,next){
    const errors =validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        })
    }
    next();
 }

const validateUser = [
    body("username")
    .notEmpty().withMessage("username is required")
    .isString().withMessage("username must be string")
    .isLength({min:5}).withMessage("Atleast more than 3 letters"),


    body('email')
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be in email format")
    .isString().withMessage("Email must be in String format"),

    body("password")
    .notEmpty().withMessage("password is required")
    .isLength({min:8,max:30}).withMessage("password must be atleast more than 8 letters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

    validation
]

export {validateUser};