import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import dotenv from 'dotenv';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import crypto from "crypto";
import sendEmail from '../utils/mailer.js';
// import sendEmail from "../utils/sendEmail.js"; // adjust path if needed

dotenv.config();

// 🟩 Register (Sign Up)
export const registerUser = AsyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Validation
  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Create new user (password hashing is handled by pre-save hook in model)
  const newUser = await User.create({
    fullName,
    email,
    password,
    role,
  });

  const createdUser = await User.findById(newUser._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", createdUser)
  );
});

// 🟦 Login
export const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Compare password
  const isMatch = await user.isPasswordMatched(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const loggedInUser = await User.findById(user._id).select("-password");

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", token, option)
    .json(
      new ApiResponse(
        200,
        "User logged In Successfully",
        {
          user: loggedInUser,
          token
        }
      )
    )
});

// 🟨 Get User Profile
export const getUserProfile = AsyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User profile fetched successfully", req.user));
});

// 🟧 Update User Profile 
export const updateUserProfile = AsyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email
      }
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully", user));
});


// import crypto from "crypto";
// import sendEmail from "../utils/sendEmail.js";

export const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔢 Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // ❌ No hashing — store directly
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save({ validateBeforeSave: false });

  // 📧 Email message
  const message = `
Hello,

Your OTP for password reset is: ${otp}

This OTP will expire in 15 minutes.

If you did not request this, please ignore this email.
`;

  try {
    await sendEmail(user.email, "Password Reset OTP", message);

    return res.status(200).json(
      new ApiResponse(200, "OTP sent to your email")
    );
  } catch (error) {
    // Cleanup if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Email could not be sent");
  }
});




export const verifyOtp = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validation
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ✅ Check OTP + expiry
  if (
    user.resetPasswordToken !== otp ||
    user.resetPasswordExpire < Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  return res.status(200).json(
    new ApiResponse(200, "OTP verified successfully")
  );
});


export const resetPassword = AsyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  // Validation
  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ✅ Verify OTP again (for safety)
  // if (
  //   user.resetPasswordToken !== otp ||
  //   user.resetPasswordExpire < Date.now()
  // ) {
  //   throw new ApiError(400, "Invalid or expired OTP");
  // }

  // 🔐 Set new password (will be hashed by pre-save hook)
  user.password = newPassword;

  // 🧹 Clear OTP fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Password reset successful")
  );
});