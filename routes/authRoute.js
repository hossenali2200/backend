import express from "express";
import {
    registerController, 
    loginController, 
    testController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    generateOTP,
    verifyOTP} 
    from '../controllers/authController.js'

import {isAdmin, requireSignIn, localVariables} from './../middlewares/authmiddleware.js'

//router object

const router = express.Router()


//routing
//register || METHOD POST

router.post('/register', registerController)

//LOGIN || POST

router.post('/login', loginController)


//Forgot password || POST
router.post('/forgot-password',forgotPasswordController)
//test routes

router.get('/test', requireSignIn, isAdmin, testController)

//protected user route auth

router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ok:true})
});
//protected admin route auth

router.get('/admin-auth', requireSignIn,isAdmin, (req, res) => {
    res.status(200).send({ok:true})
});


router.route('/generateOTP').get(requireSignIn, localVariables, generateOTP) // generate random OTP
router.route('/verifyOTP').get(requireSignIn, verifyOTP) // verify generated OTP


//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get('/orders', requireSignIn, getOrdersController)
//orders
router.get('/all-orders', requireSignIn,isAdmin, getAllOrdersController)


// order status update
router.put(
    "/order-status/:orderId",
    requireSignIn,
    isAdmin,
    orderStatusController
  );


export default router