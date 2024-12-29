const { User } = require("../models/userModel");
const { createLog } = require("../models/logModel");
const { generateToken } = require("../utils/authUtils");
const bcrypt = require("bcryptjs");
const useragent = require("user-agent");
const nodemailer = require("nodemailer");
// const { getSocket } = require("../utils/socket");
// const io = getSocket();

const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashPassword,
      name,
    });

    await user.save();

    const userAgentData = useragent.parse(req.headers["user-agent"]);
    const userAgent = userAgentData?.fullName?.trim()
      ? userAgentData.fullName.trim()
      : userAgentData?.full || "Unknown User-Agent";
    await createLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: "signup",
      details: {
        ip: req.ip,
        userAgent: userAgent,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const userAgentData = useragent.parse(req.headers["user-agent"]);
  const userAgent = userAgentData?.fullName?.trim()
    ? userAgentData.fullName.trim()
    : userAgentData?.full || "Unknown User-Agent";
  // const io = getSocket();
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      await user.save();

      // if (user.failedLoginAttempts > 3) {
      //   io.to("admin").emit("critical-notification", {
      //     message: `Multiple failed login attempts detected for ${email}`,
      //     timestamp: new Date(),
      //   });
      // }

      await createLog({
        action: "login_failed",
        userEmail: email,
        details: {
          ip: req.ip,
          userAgent: userAgent,
        },
      });

      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // setInterval(() => {
    //   console.log("Success");
    //   io.to("admin").emit("critical-notification", {
    //     message: `Multiple failed login attempts detected after 5 seconds`,
    //     timestamp: new Date(),
    //   });
    // }, 5000);

    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    const userId = user._id.toString();

    const token = generateToken(user.email, user.isAdmin, userId, "1d");
    user.lastLogin = new Date();
    await user.save();
    await createLog({
      userId: user._id,
      userEmail: user.email,
      action: "login",
      details: {
        ip: req.ip,
        userAgent: userAgent,
      },
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user._id.toString();

    const resetToken = generateToken(user.email, user.isAdmin, userId, "1d");

    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    const resetLink = `${process.env.REACT_APP_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const receiver = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Hi ${user.name},</p>
             <p>You requested to reset your password. Click the link below to reset it:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };

    await transporter.sendMail(receiver);

    const userAgentData = useragent.parse(req.headers["user-agent"]);
    const userAgent = userAgentData?.fullName?.trim()
      ? userAgentData.fullName.trim()
      : userAgentData?.full || "Unknown User-Agent";
    await createLog({
      userEmail: email,
      action: "forgot_password",
      details: {
        ip: req.ip,
        userAgent: userAgent,
      },
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({
      success: false,
      message: "Invalid token or password does not meet requirements.",
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
