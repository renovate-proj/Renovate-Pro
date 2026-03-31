import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['Customer', 'Surveyor', 'Planner'],
    default: 'Customer',
    required: true,
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {  
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

//hash the password before saving
userSchema.pre('findOneAndUpdate', async function(next) {
    // Check if the password field has been modified   
    if (this._update.password) {
        this._update.password = await bcrypt.hash(this._update.password, 12);
    }
    next();
});
userSchema.methods.isPasswordMatched = async function(password)  {
    return await bcrypt.compare(password, this.password);
};


const User = mongoose.model('User', userSchema);
export default User;