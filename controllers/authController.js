import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken"
import otpGenerator from 'otp-generator'

export const registerController = async(req, res) =>{
    try {
       const {name, email, password, phone, address,answer} = req.body 
       //validation

       if(!name){
        return res.send ({message:'Name is required'})
       }
       if(!email){
        return res.send ({message:'Email is required'})
       }
       if(!password){
        return res.send ({message:'Password is required'})
       }
       if(!phone){
        return res.send ({message:'Phone is required'})
       }
       if(!address){
        return res.send ({message:'Address is required'})
       }
       if(!answer){
        return res.send ({message:'Answer is required'})
       }

       //check user
       const exisitingUser = await userModel.findOne({email})

       //existing user
       if(exisitingUser){
        return res.status(200).send({
            success:false,
            message:'Already Register please login'
        })
       }
       //register user
       const hashedPassword = await hashPassword(password)

       //saved
       const user = await new userModel({name,email,phone,address,password:hashedPassword,answer}).save()
        res.status(201).send({
            success:true,
            message:'User Register Succesfully',
            user

        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in registration',
            error
        })
    }
};

//POST LOGIN

export const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
  };

  //forgot Password Controller

  export const forgotPasswordController= async (req, res) =>{
    try {
const {email, question, newPassword} = req.body
if(!email){
  res.status(400).send({message:'Email is required'})
}
if(!answer){
  res.status(400).send({message:'Answer is required'})
}
if(!newPassword){
  res.status(400).send({message:'New Password is required'})
}
//check
const user= await userModel.findOne({email,answer})
//validation

if(!user){
  return res.status(404).send({
    success:false,
    message:'Wrong Email or Answer'
  })
}
const hashed = await hashedPassword(newPassword)
await userModel.findByIdAndUpdate(user._id,{password:hashed})
res.status(200).send({
  success:true,
  message:"Password Reset Successfully"
}) 
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success:false,
        message:'Something went wrong',
        error
      })
    }
  };

  //test controller

  export const testController = (req,res) =>{
    res.send("protected Route");
  }


  //otp generator
  // Get:http://localhost:8000/api/v1/generateOtp

  export async function generateOTP(req,res){
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    res.status(201).send({ code: req.app.locals.OTP })
  }

  /** GET: http://localhost:8080/api/v1/verifyOTP */
export async function verifyOTP(req,res){
  const { code } = req.query;
  if(parseInt(req.app.locals.OTP) === parseInt(code)){
      //req.app.locals.OTP = null; // reset the OTP value
      //req.app.locals.resetSession = true; // start session for reset password
      return res.status(201).send({ msg: 'Verify Successsfully!'})
  }
  return res.status(400).send({ error: "Invalid OTP"});
}





  //update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};


//orders controller

export const getOrdersController = async(req,res) => {
  try {
    const orders = await orderModel
    .find({buysr:req.user._id})
    .populate("products","-photo")
    .populate("buyer","name")
    res.json(orders)
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:'Error While Getting Orders ',
      error
    })
  }
};
//Admin orders controller

export const getAllOrdersController = async(req,res) => {
  try {
    const orders = await orderModel
    .find({ })
    .populate("products","-photo")
    .populate("buyer","name")
    .sort({createdAt: "-1"})
    res.json(orders)
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:'Error While Getting Orders ',
      error
    })
  }
};


//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};