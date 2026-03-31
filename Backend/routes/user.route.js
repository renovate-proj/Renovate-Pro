import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile,forgotPassword ,verifyOtp,resetPassword,getSurveyors} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/verifyotp', verifyOtp);
router.post('/resetpassword', resetPassword);

// Secured Routes
router.route("/me").get(verifyJWT, getUserProfile);
router.route("/update-account").patch(verifyJWT, updateUserProfile);
router.route("/surveyors").get(verifyJWT, getSurveyors);

export default router;
