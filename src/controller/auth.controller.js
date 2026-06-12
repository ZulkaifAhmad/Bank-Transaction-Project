import User from "../schema/user.schema.js";
import jwt from "jsonwebtoken";
import { SendEmail } from "../services/email.service.js";

const status = {
  login: "login",
  register: "register",
  logout: "logout",
};

async function Register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        Message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        Message: "User already exists",
      });
    }

    const saveUser = new User({
      name: name,
      email: email,
      password: password,
    });

    const token = jwt.sign({ id: saveUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    const savedUser = await saveUser.save();
    if (savedUser) {
      const sendEmail = await SendEmail(email, name, status.register);
      if (sendEmail) {
        console.log(`Email sent: ${sendEmail.id} ${sendEmail.data}`);
      }
    }

    savedUser.password = undefined;
    console.log(savedUser);

    res.status(201).json({
      Message: "User Created Successfully",
      saveUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
}

async function Login(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email && !name) {
      return res.status(400).json({
        Message: "Email or username is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        Message: "All fields are required",
      });
    }
    const isExistingUser = await User.findOne({
      $or: [{ email: email }, { name: name }],
    });

    if (!isExistingUser) {
      return res.status(400).json({
        Message: "Invalid Credentials",
      });
    }

    const isPasswordMatch = await isExistingUser.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        Message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ id: isExistingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);



    const sendEmail = await SendEmail(
      isExistingUser.email,
      isExistingUser.name,
      status.login,
    );
    if (sendEmail) {
      console.log(`Email sent: ${sendEmail.id} ${sendEmail.data}`);
    }

    isExistingUser.password = undefined;

    res.status(200).json({
      Message: "Login Successful",
      isExistingUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
}

async function Logout(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({
      Message: "Logout Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
}

export { Register, Login, Logout };
