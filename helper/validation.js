import joi from "joi";
const registerUserValidation=async(user)=>{
    const schema=joi.object({
        username:joi.string().required(),
        email:joi.string().email(),
        password:joi.string().min(8).required(),
        mobile:joi.string().min(10).max(10)
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



const verifyOtpValidation=async(user)=>{
  const schema=joi.object({
    email:joi.string().email(),
    mobile:joi.string().min(10).max(10),
    otp:joi.string().min(4).max(4).required()
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


export {registerUserValidation,loginValidation,verifyOtpValidation}