import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    id_number: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "Admin", "Lab Technician"],
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // placeholder for our password requirement
    },
    bio: {
      type: String,
      default: "No description provided.",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    collection: "Users",
  }
);

// Password hashing
/*
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new or modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
*/

export default mongoose.model("Users", userSchema);