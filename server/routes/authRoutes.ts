import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employee from "../db/Employees";
import Manager from "../db/Manager";
import Attendance from "../db/Attendance";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "peoplepay360-secret-key";

// =========================
// SIGN UP
// =========================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      gender,
      email,
      phone,
      password,
      role,
      userType,
      status,
      dob,
      joining,
      payout,
      allocation,
      location,
      manager,
      department,
      company,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !userType) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, role and userType are required",
      });
    }

    // Validate user type
    if (userType !== "EMPLOYEE" && userType !== "MANAGER") {
      return res.status(400).json({
        success: false,
        message: "Invalid user type. Use EMPLOYEE or MANAGER",
      });
    }

    // Check existing user
    const existingUser =
      userType === "EMPLOYEE"
        ? await Employee.findOne({ email })
        : await Manager.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          userType === "EMPLOYEE"
            ? "Employee with this email already exists"
            : "Manager with this email already exists",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);



    if (userType === "EMPLOYEE") {
      const employee = await Employee.create({
        name,
        gender,
        email,
        phone,
        password: hashPass,
        userType: "EMPLOYEE",
        role,
        status,
        dob,
        joining,
        payout,
        allocation,
        location,
        manager,
      });

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          status: employee.status,
          userType: employee.userType,
        },
      });
    }



    const managerUser = await Manager.create({
      name,
      email,
      password: hashPass,
      userType: "MANAGER",
      role,
      dob,
      joining,
      department,
      company,
    });

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      manager: {
        id: managerUser._id,
        name: managerUser.name,
        email: managerUser.email,
        role: managerUser.role,
        department: managerUser.department,
        userType: managerUser.userType,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


router.post("/signin", async (req, res) => {
  try {
    const {
      email,
      password,
      userType,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password and userType are required",
      });
    }

    if (
      userType !== "EMPLOYEE" &&
      userType !== "MANAGER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userType. Use EMPLOYEE or MANAGER",
      });
    }

    // =========================
    // NORMALIZE EMAIL
    // =========================

    const normalizedEmail = email.toLowerCase().trim();

    // =========================
    // FIND USER
    // =========================

    const fetchedUser =
      userType === "EMPLOYEE"
        ? await Employee.findOne({
          email: normalizedEmail,
        }).select("+password")
        : await Manager.findOne({
          email: normalizedEmail,
        }).select("+password");

    if (!fetchedUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // =========================
    // CHECK PASSWORD
    // =========================

    const passwordMatch = await bcrypt.compare(
      password,
      fetchedUser.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // =========================
    // RECORD EMPLOYEE LOGIN
    // =========================

    // =========================
    // RECORD EMPLOYEE LOGIN
    // =========================

    if (userType === "EMPLOYEE") {
      // console.log("=================================");
      // console.log("ATTENDANCE: Employee login detected");
      // console.log("Employee ID:", fetchedUser._id);
      // console.log("=================================");

      const now = new Date();

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // console.log("Now:", now);
      // console.log("Start of day:", startOfDay);


      let attendance = await Attendance.findOne({
        employee: fetchedUser._id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      // console.log("Existing attendance:", attendance);

      if (!attendance) {
        attendance = await Attendance.create({
          employee: fetchedUser._id,
          date: startOfDay,
          loginTime: now,
          status: "ABSENT",
        });

        // console.log("New attendance created:", attendance);
      } else {
        // console.log("Attendance already exists for today");
      }
    }

    // =========================
    // CREATE JWT
    // =========================

    const token = jwt.sign(
      {
        id: fetchedUser._id.toString(),
        email: fetchedUser.email,
        role: fetchedUser.role,
        userType: userType,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // =========================
    // SET COOKIE
    // =========================

    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      message: "Signin successful",
      user: {
        id: fetchedUser._id,
        name: fetchedUser.name,
        email: fetchedUser.email,
        role: fetchedUser.role,
        userType: userType,
      },
    });

  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});



router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      userType: "EMPLOYEE" | "MANAGER";
    };

    console.log("========== /me ==========");
    console.log("Decoded JWT:", decoded);
    console.log("User ID:", decoded.id);
    console.log("User Type:", decoded.userType);

    const user =
      decoded.userType === "EMPLOYEE"
        ? await Employee.findById(decoded.id)
        : await Manager.findById(decoded.id);

    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: decoded.userType,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});


router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not logged in",
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      id: string;
      email: string;
      role: string;
      userType: "EMPLOYEE" | "MANAGER";
    };

    // =========================
    // RECORD EMPLOYEE LOGOUT
    // =========================

    if (decoded.userType === "EMPLOYEE") {
      const now = new Date();

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const attendance = await Attendance.findOne({
        employee: decoded.id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (attendance && attendance.loginTime) {
        attendance.logoutTime = now;

        // Calculate working time
        const workingMilliseconds =
          now.getTime() -
          attendance.loginTime.getTime();

        const workingMinutes = Math.floor(
          workingMilliseconds / (1000 * 60)
        );

        attendance.totalWorkingMinutes = workingMinutes;

        // =========================
        // CALCULATE ATTENDANCE
        // =========================

        if (workingMinutes >= 480) {
          attendance.status = "PRESENT";
        } else if (workingMinutes >= 240) {
          attendance.status = "HALF_DAY";
        } else {
          attendance.status = "ABSENT";
        }

        await attendance.save();
      }
    }

    // =========================
    // CLEAR JWT COOKIE
    // =========================

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;

