const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/environment');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AuthController {
  /**
   * User login endpoint
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Please provide both email and password', { code: 'INVALID_INPUT' }, 400);
      }

      // Explicitly select password field
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

      if (!user) {
        return errorResponse(res, 'Invalid credentials', { code: 'AUTH_FAILED' }, 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return errorResponse(res, 'Invalid credentials', { code: 'AUTH_FAILED' }, 401);
      }

      if (!user.isActive) {
        return errorResponse(res, 'User account is inactive. Please contact administrator.', { code: 'ACCOUNT_INACTIVE' }, 403);
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user._id,
          id: user._id,
          email: user.email,
          role: user.role,
          district: user.district,
          office: user.office,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return successResponse(
        res,
        'Login successful',
        {
          token,
          user: {
            userId: user.userId,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            district: user.district,
            taluk: user.taluk,
            office: user.office,
          },
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current user profile
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      return successResponse(res, 'User profile retrieved', { user }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User Registration (Utility)
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role, district, taluk, office } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return errorResponse(res, 'User already exists with this email', { code: 'USER_EXISTS' }, 400);
      }

      const user = new User({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: role || 'CITIZEN',
        district: district || 'Coimbatore',
        taluk: taluk || 'Coimbatore North',
        office: office || 'Taluk Office, Coimbatore North',
      });

      await user.save();

      const token = jwt.sign(
        {
          userId: user._id,
          id: user._id,
          email: user.email,
          role: user.role,
          district: user.district,
          office: user.office,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return successResponse(
        res,
        'User registered successfully',
        {
          token,
          user: user.toJSON(),
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
