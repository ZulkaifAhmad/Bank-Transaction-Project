import jwt from "jsonwebtoken";

function authUser(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Please Login first || No token found",
      });
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = verify;
    next();

  } catch (error) {

    return res.status(501).json({
      message: "Invalid or Expire token",
      error: error,
    });

  }
}

export { authUser };
