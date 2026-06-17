import jwt from "jsonwebtoken";
import User from "../schema/user.schema.js";
import BlockListToken from "../schema/blocklist.schema.js";

async function authUser(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Please Login first || No token found",
      });
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET);

    const checkBlockList = await BlockListToken.findOne({
      token: token,
    });

    if (checkBlockList) {
      return res.status(400).json({
        message: "This token is already Blocked || Access not allowed",
      });
    }

    req.user = verify;
    next();
  } catch (error) {
    return res.status(501).json({
      message: "Invalid or Expire token",
      error: error,
    });
  }
}

async function authSystemUser(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({
        message: "Token not found",
      });
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    const checkBlockList = await BlockListToken.findOne({
      token: token,
    });

    if (checkBlockList) {
      return res.status(400).json({
        message: "This token is already Blocked || Access not allowed",
      });
    }
    const findSystemUser = await User.findById(verify.id).select("+systemUser");
    if (!findSystemUser.systemUser) {
      console.log(
        "invalid token or user || not find any system user in middleware",
      );
      return res.status(403).json({
        message:
          "invalid token or user || not find any system user in middleware",
      });
    }
    req.user = findSystemUser;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
}
export { authUser, authSystemUser };
