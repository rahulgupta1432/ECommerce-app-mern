import joi from "joi";
const registerUserValidation=async(user)=>{
    const schema=joi.object({
        name:joi.string().required(),
        email:joi.string().email().required(),
        password:joi.string().required(),
        phone:joi.string().required(),
        address:joi.string().required(),
        // answer:joi.string().required()
    });
    let valid = await schema
    .validateAsync(user, { abortEarly: false })
    .catch((error) => {
        console.log("err",error)
      return { error };
    });
  if (!valid || (valid && valid.error)) {
    let msg = [];
    for (let i of valid.error.details) {
        console.log(valid.error)
      msg.push(i.message);
    }
    return { error: msg };
  }
  return { data: valid };
};

const loginValidation=async(user)=>{
    const schema=joi.object({
        email:joi.string().email().required(),
        password:joi.string().required()
    })
    let valid = await schema
    .validateAsync(user, { abortEarly: false })
    .catch((error) => {
      return { error };
    });
  if (!valid || (valid && valid.error)) {
    let msg = [];
    for (let i of valid.error.details) {
      msg.push(i.message);
    }
    return { error: msg };
  }
  return { data: valid };
}


export {registerUserValidation,loginValidation}