import type { NextFunction, Request, Response } from "express";

import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import OtpModel from "../models/otp.model";
import eventEmitter from "../utils/events";
import { sendMail } from "../utils/mail";

const saltRound = 10;

type LoginPayload = {
  email: string;
  password: string;
};

const SECRETKEY = process.env.SECRET;
/*
  if (!user?.isVerified) {
    // checking wheather the otp was already created
    const userwithOtp = await OtpModel.findOne({ user: user?.id }).lean();
    if (userwithOtp) {
      const otp = generateOtp();

      // updating the otp in DB
      await OtpModel.findByIdAndUpdate(userwithOtp._id, {
        user: user._id,
        otp,
      });

      // sending email with otp
      eventEmitter.emit("sendmail", {
        to: user.email,
        subject: "OTP Verification code",
        info: `OTP = ${otp}`,
      });
      return res.send({
        valid: true,
        message: `Unverified user, OTP send successfully`,
      });
    } else {
      const otp = generateOtp();

      const isOtpMailSend = await sendMail({
        to: body?.email,
        info: `OTP = ${otp}`,
        subject: "OTP verification code",
      });

      // saving otp to db
      if (isOtpMailSend) {
        const SavingOtpToDB = new OtpModel({ otp, user: user._id });
        await SavingOtpToDB.save();

        return res.send({
          valid: true,
          message: `Unverified user, OTP send successfully`,
        });
      }
    }
  }
  */
export const LoginController = async (req: Request, res: Response) => {
  const body: LoginPayload = req.body;

  // response if email , password isn't get in request
  if (!(body?.email && body?.password)) {
    return res.send({
      valid: false,
      message: "email & password is required",
    });
  }

  let user: any = await UserModel.findOne({ email: body.email })
    .populate("cart.product")
    .populate("orders")
    .lean();
  if (user === null) {
    return res.status(200).send({
      valid: false,
      message: "user not exists",
    });
  }
  console.log(user, ": user");

  const isValidPassword = bcrypt.compareSync(body?.password, user?.password);

  if (!isValidPassword) {
    return res.send({
      valid: false,
      message: "Incorrect Password",
    });
  }
  const token = jwt.sign(user?.email!, SECRETKEY!);

  return res.send({
    valid: true,
    message: { user, token },
  });
};

type SignupPayload = {
  email: string;
  password: string;
  dateOfBirth: String;
  name: string;
};
export const SignUpController = async (req: Request, res: Response) => {
  const body: SignupPayload = req.body;

  if (!(body?.email && body?.password)) {
    console.log(body?.email, body?.password);
    return res.send({
      valid: false,
      message: "email and password is required",
    });
  }

  if (body.password.length < 8) {
    return res.send({
      valid: false,
      message: "password length should be greater than 7",
    });
  }

  try {
    const user = await UserModel.findOne({ email: body.email });
    if (user !== null) {
      return res.send({
        valid: false,
        message: "User already exists",
      });
    }
  } catch (err) {
    return res.send({
      valid: true,
      message: "Failed to fetch user data",
    });
  }

  const hash = await bcrypt.hash(body.password, saltRound);
  body.password = hash;
  const newUser = new UserModel(body);

  try {
    const saveUserResponse = await newUser.save();
    console.log(saveUserResponse);

    const token = jwt.sign(saveUserResponse?.email!, SECRETKEY!);

    return res.send({
      valid: true,
      message: {
        user: saveUserResponse,
        token: token,
      },
    });
  } catch (err: any) {
    console.log("Failed to save user");
    console.log(err);
    return res.sendStatus(500);
  }
};

// TODO verifyOtp
type verifyOtpPayload = {
  email: string;
  otp: string;
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // return res.sendStatus(200);
  const body: verifyOtpPayload = req.body;
  const { email } = body;
  const otp = Number(body.otp);
  // user details to update isVerified field.
  const user: any = await UserModel.findOne({ email: email }).lean();
  console.log(user, 0);
  if (!(email && otp)) {
    return res.status(200).json({
      valid: true,
      messagge: "email & otp are required",
    });
  }
  if (!user) {
    return res.status(200).json({
      valid: false,
      message: "no such user exists",
    });
  } else if (user?.isVerified) {
    return res.status(200).send({
      valid: false,
      message: "user already verified",
    });
  }

  const DbOtp = await OtpModel.findOne({ user: user?._id.toString() });
  console.log(DbOtp, 0);
  if (!DbOtp) {
    next(`${email} otp isn't saved in DB`);
  } else {
    if (DbOtp?.otp === otp) {
      console.log("Otp verification stage");
      console.log("user: " + user);
      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: user?._id },
          { isVerified: true },
          { new: true }
        );
        console.log(updatedUser, ": updatedUser");
      } catch (err) {
        return res.sendStatus(500);
      }
      const response = await DbOtp.deleteOne();
      console.log(response);
      return res.status(200).send({
        valid: true,
        message: "email verified successfully",
      });
    } else {
      return res.status(200).send({
        valid: false,
        message: "invalid otp",
      });
    }
  }
};

// TODO need completion
export const sendOtp = async (req: any, res: Response, next: NextFunction) => {
  // const body: { email: String } = req.body;

  const token = req?.token!;

  if (!token) {
    return res.status(401).json({
      valid: false,
      message: "Token is required",
    });
  }

  const email = jwt.verify(token, SECRETKEY!);

  console.log(email, 29);

  try {
    const user = await UserModel.find({ email: email });
    if (!user) {
      return res.status(200).send({
        valid: false,
        message: "user account not more exists",
      });
    }
    // @ts-ignore
    const previousOtp = await OtpModel.find({ user: user?._id });

    if (previousOtp.length > 0) {
      console.log(previousOtp);
      next(new Error("Working: have some previous otp"));
    } else {
      console.log("no previous otp found");
      const generateOtp = () => Math.floor(Math.random() * 8999) + 1000;
      const otp = generateOtp();
      const saveOtp = new OtpModel({
        // @ts-ignore
        user: user?._id,
        otp,
      });
      await saveOtp.save();
      eventEmitter.emit("sendmail");
      return res.status(200).json({ valid: true, otp });
    }
  } catch (err) {
    next(err);
  }
  // if(jwt.verify())

  // try {
  //   const previousSavedOtp = await OtpModel.findOne({
  //     email: body.email,
  //   }).lean();

  //   if (!previousSavedOtp) {
  //     const saveOtp = new OtpModel();
  //   }
  // } catch (err) {
  //   next(err);
  // }
  // return res.sendStatus(500);
};
