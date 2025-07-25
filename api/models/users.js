import mongoose from "mongoose";

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
      enum: ["Student", "Admin", "Lab Technician"],
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

export default mongoose.model("Users", userSchema);
