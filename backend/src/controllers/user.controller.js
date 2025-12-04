const userRepository = require('../repositories/user.repository');
const { successResponse, errorResponse } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const users = await userRepository.getAll(limit, offset);
    const total = await userRepository.count();
    const totalPages = Math.ceil(total / limit);

    return successResponse(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const user = await userRepository.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Only admin can change role
    if (role && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can change user role');
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse(res, 400, 'Invalid email format');
      }
      updateData.email = email;
    }
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    // Check for duplicates
    if (updateData.username) {
      const existingUser = await userRepository.findByUsername(updateData.username);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return errorResponse(res, 409, 'Username already taken');
      }
    }

    if (updateData.email) {
      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return errorResponse(res, 409, 'Email already taken');
      }
    }

    const updatedUser = await userRepository.update(id, updateData);

    return successResponse(res, 200, 'User updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.userId) {
      return errorResponse(res, 400, 'Cannot delete your own account');
    }

    const user = await userRepository.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Note: In a real application, you might want to soft delete
    // For now, we'll just return success (actual deletion would require cascade handling)
    return successResponse(res, 200, 'User deletion requested (implement cascade delete in database)');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

