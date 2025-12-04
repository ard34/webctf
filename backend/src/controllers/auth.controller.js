const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return errorResponse(res, 400, 'Username, email, and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }

    // Check if user already exists
    const existingUser = await userRepository.findByUsername(username) || 
                        await userRepository.findByEmail(email);
    
    if (existingUser) {
      return errorResponse(res, 409, 'Username or email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Generate token
    const token = generateToken({ userId, username, email, role: 'user' });

    // Get user data (without password)
    const user = await userRepository.findById(userId);

    return successResponse(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return errorResponse(res, 400, 'Username and password are required');
    }

    // Find user
    const user = await userRepository.findByUsername(username);
    
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userData } = user;

    return successResponse(res, 200, 'Login successful', {
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.userId);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return errorResponse(res, 400, 'Username and email are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }

    // Check if username or email is already taken by another user
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser && existingUser.id !== req.userId) {
      return errorResponse(res, 409, 'Username already taken');
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail && existingEmail.id !== req.userId) {
      return errorResponse(res, 409, 'Email already taken');
    }

    const updatedUser = await userRepository.update(req.userId, { username, email });

    return successResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    // Get user with password
    const user = await userRepository.findByUsername(req.user.username);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(req.userId, hashedPassword);

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};

