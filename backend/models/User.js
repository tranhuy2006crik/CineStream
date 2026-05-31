import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profiles: {
    type: [profileSchema],
    default: [
      {
        name: 'Alex',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoaxqDa9tiqBwh_IIwp1iuzBLGZObCw1YDPCnt1mxTpqaQRGseQzZMzzsQWZW_7ZF-DMfuQgH--xJUcaONEpYIeQM7kPxjeF0DqxczdVOMQP3uGkR1RAC3XwDIR_G98WuDmL-kwVhVJ_W4Wb1mBT4CdiZ9tR4RGh3aOdQmaN5zwBOkuLi2z71oWkft-AHJv_A0BipjD9Bpe-kAU4CJ1hu6z9hvf66t04nlwu5BiC-DGFiTCCWDq93-F2fyzPeEol1nCPfrTPG5OBs',
      },
      {
        name: 'Sam',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm2yBKwJxcjMwvbpi5tZjXY-CThB92pnuc7tYt62ZmbjspAQwnx3aspKWqhOZyI1X3YxTiw28NBsosKqgiYe6jJSqzoxPXAg_xv-HxGgMfGGxYUxlm_04CoPrwXaorhe_01NKmiDB1i8se6jjGc_tDUSmdTdFtzsB6ZqzTssqS82NC7c4X8e8PQQakOnwO9A3H9tFbhVPvpBXcH3zGp-jCoWBSU47U0feRWl7m8GnDajZbKfr6tGBAxofzIbjE8YtbyfMjRpsmwqc',
      },
      {
        name: 'Guest',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOdW-FiudtRQGcMp8aUUXFqRzLOFikSjHssghPKt6r2trbkDjplnMyaMcXcjs7gz-fx3XDUtonBZfpKBKVhote08zzdX-aXQwv73-HS4_zUM1R6G4kmZRL6ill0kGL_v-tzxF4i_sRlbpjVsZLFRqVPsW0em2u4_tS1aEPdlp3OzNX1QDpbtmWFiprztLYv3O1F5ivBn2erhs283PlN3pA0FRfdAQbpoB2JJZoxHw_5627zexNLDjPf14b7To7Q-4HW8J0UGLenVs',
      }
    ]
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
