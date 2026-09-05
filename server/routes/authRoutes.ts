import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "peoplepay360-secret-key";

// Temporary HR account
const HR_USER = {
  id: "hr-001",
  name: "HR Manager",
  email: "hr@peoplepay360.com",
  passwordHash: bcrypt.hashSync("123456", 10),
  role: "HR",
};

// =========================
// HR SIGN IN
// =========================

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (email.toLowerCase() !== HR_USER.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      HR_USER.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: HR_USER.id,
        email: HR_USER.email,
        role: HR_USER.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "HR sign-in successful",
      token,
      user: {
        id: HR_USER.id,
        name: HR_USER.name,
        email: HR_USER.email,
        role: HR_USER.role,
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// =========================
// CURRENT USER
// =========================
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required",
    });
  }

  const token = authHeader.split(" ")[1];

  // Extra validation for TypeScript + invalid header safety
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization token",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});