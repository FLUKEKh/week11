// services/userService.js
const userRepository = require('../repositories/userRepository');

const userService = {
  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters = {}) {
    try {
      const users = await userRepository.findAll(filters);
      return users;
    } catch (error) {
      console.error('Error in getAllUsers service:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Error in getUserById service:', error);
      throw error;
    }
  },

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      // 1. Validate username format
      const usernameRegex = /^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
      if (!usernameRegex.test(userData.username)) {
        throw new Error('Invalid username format. Use AGxxx, SPxxx, or ADxxx (001-999)');
      }

      // 2. Check if username already exists
      const exists = await userRepository.usernameExists(userData.username);
      if (exists) {
        throw new Error(`Username "${userData.username}" already exists`);
      }

      // ✅ 3. Validate role-specific rules
      if ((userData.role === 'Agent' || userData.role === 'Supervisor') && !userData.teamId) {
        throw new Error('Team ID is required for Agent and Supervisor roles');
      }

      if (userData.role === 'Admin' && userData.teamId) {
        throw new Error('Admin should not belong to a team');
      }

      // 4. Create user
      const newUser = await userRepository.create(userData);
      return newUser;
    } catch (error) {
      console.error('Error in createUser service:', error);
      if (error.code === 'SQLITE_CONSTRAINT') {
        if (error.message.includes('UNIQUE')) {
          throw new Error(`Username "${userData.username}" already exists`);
        }
        if (error.message.includes('FOREIGN KEY')) {
          throw new Error(`Team ID ${userData.teamId} does not exist`);
        }
      }
      throw error;
    }
  },

  /**
   * Update existing user
   */
  async updateUser(userId, userData) {
    try {
      // 1️⃣ ตรวจสอบว่า user มีอยู่จริง
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) throw new Error('User not found');

      // 2️⃣ ตรวจสอบว่าไม่มีการเปลี่ยน username
      if (userData.username && userData.username !== existingUser.username) {
        throw new Error('Username cannot be changed');
      }

      // 3️⃣ Validate role-specific rules
      const newRole = userData.role || existingUser.role;
      const newTeamId =
        userData.teamId !== undefined ? userData.teamId : existingUser.teamId;

      if ((newRole === 'Agent' || newRole === 'Supervisor') && !newTeamId) {
        throw new Error('Team ID is required for Agent and Supervisor roles');
      }

      if (newRole === 'Admin' && newTeamId) {
        throw new Error('Admin should not belong to a team');
      }

      // 4️⃣ อัปเดตข้อมูล
      const updatedUser = await userRepository.update(userId, userData);
      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser service:', error);
      throw error;
    }
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    try {
      // 1️⃣ ตรวจสอบว่า user มีอยู่จริง
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('User not found');

      // 2️⃣ Soft delete
      await userRepository.softDelete(userId);

      // 3️⃣ Return result
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error in deleteUser service:', error);
      throw error;
    }
  },

  /**
   * Validate username format
   */
  validateUsername(username) {
    const regex = /^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
    return regex.test(username);
  },

  /**
   * Get role from username prefix
   */
  getRoleFromUsername(username) {
    if (username.startsWith('AG')) return 'Agent';
    if (username.startsWith('SP')) return 'Supervisor';
    if (username.startsWith('AD')) return 'Admin';
    return null;
  }
};

module.exports = userService;