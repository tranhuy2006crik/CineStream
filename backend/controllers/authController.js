import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyIdToken } from '../config/firebaseAdmin.js';
import crypto from 'crypto';

// Generate token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      email,
      password,
    });
    
    if (user) {
      return res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        cinemaId: user.cinemaId,
        profiles: user.profiles,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        cinemaId: user.cinemaId,
        profiles: user.profiles,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('getMe error:', error.message);
    return res.status(500).json({ message: 'Server error getting user profile' });
  }
};

// @desc    Add profile to user
// @route   POST /api/auth/profile
// @access  Private
export const createProfile = async (req, res) => {
  const { name, avatar } = req.body;
  
  if (!name || !avatar) {
    return res.status(400).json({ message: 'Please provide profile name and avatar' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profiles.length >= 5) {
      return res.status(400).json({ message: 'Maximum 5 profiles allowed' });
    }
    
    user.profiles.push({ name, avatar });
    await user.save();
    
    return res.status(201).json(user.profiles);
  } catch (error) {
    console.error('Create profile error:', error.message);
    return res.status(500).json({ message: 'Server error creating profile' });
  }
};

// @desc    Social Login (Google/Facebook via Firebase)
// @route   POST /api/auth/social-login
// @access  Public
export const socialLogin = async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const decodedToken = await verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from social provider' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      const newProfile = {
        name: name || email.split('@')[0],
        avatar: picture || 'https://via.placeholder.com/150',
      };

      user = await User.create({
        email,
        password: randomPassword,
        role: 'user', 
        profiles: [newProfile]
      });
    }

    return res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      cinemaId: user.cinemaId,
      profiles: user.profiles,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Social login error:', error.message);
    return res.status(401).json({ message: error.message || 'Invalid social token' });
  }
};
