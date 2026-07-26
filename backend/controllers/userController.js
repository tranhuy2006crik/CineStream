import User from '../models/User.js';

// @route   GET /api/users
// @desc    Get all users or filter by role (e.g., ?role=staff)
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    
    // Do not return passwords
    const users = await User.find(filter).select('-password').populate('cinemaId', 'name address');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách user' });
  }
};

// @route   GET /api/users/staff/cinema/:cinemaId
// @desc    Get staff working at a specific cinema
// @access  Private/Admin
export const getStaffByCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const staff = await User.find({ role: 'staff', cinemaId }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST /api/users
// @desc    Create a new user (for Admin to create Staff)
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Default avatar
    const avatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOdW-FiudtRQGcMp8aUUXFqRzLOFikSjHssghPKt6r2trbkDjplnMyaMcXcjs7gz-fx3XDUtonBZfpKBKVhote08zzdX-aXQwv73-HS4_zUM1R6G4kmZRL6ill0kGL_v-tzxF4i_sRlbpjVsZLFRqVPsW0em2u4_tS1aEPdlp3OzNX1QDpbtmWFiprztLYv3O1F5ivBn2erhs283PlN3pA0FRfdAQbpoB2JJZoxHw_5627zexNLDjPf14b7To7Q-4HW8J0UGLenVs';

    const user = new User({
      email,
      password,
      role: role || 'user',
      profiles: [{ name, avatar }]
    });

    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi tạo user' });
  }
};

// @route   PUT /api/users/:userId/assign-cinema
// @desc    Assign a staff to a cinema
// @access  Private/Admin
export const assignCinema = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cinemaId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    user.cinemaId = cinemaId;
    // ensure role is staff if they are assigned to a cinema
    if (user.role === 'user') user.role = 'staff'; 
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PUT /api/users/:userId/unassign-cinema
// @desc    Remove a staff from a cinema
// @access  Private/Admin
export const unassignCinema = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    user.cinemaId = null;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PUT /api/users/:userId
// @desc    Update user (email, role, profile name, cinemaId, optional password)
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, cinemaId, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    if (email !== undefined && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return res.status(400).json({ message: 'Email đã tồn tại' });
      user.email = email;
    }

    if (role !== undefined) {
      if (!['user', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role không hợp lệ' });
      }
      user.role = role;
    }

    if (cinemaId !== undefined) {
      user.cinemaId = cinemaId || null;
    }

    if (name !== undefined && user.profiles && user.profiles.length > 0) {
      user.profiles[0].name = name;
    }

    if (password && password.trim() !== '') {
      user.password = password;
    }

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật user' });
  }
};

// @route   DELETE /api/users/:userId
// @desc    Delete a user (cannot delete self)
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(req.user.id) === String(userId)) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    await user.deleteOne();
    res.json({ message: 'Xóa user thành công', _id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi xóa user' });
  }
};
