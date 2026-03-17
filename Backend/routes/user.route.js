import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, getSurveyors } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Secured Routes
router.route("/me").get(verifyJWT, getUserProfile);
router.route("/update-account").patch(verifyJWT, updateUserProfile);
router.route("/surveyors").get(verifyJWT, getSurveyors);

export default router;
