import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    errorSummary: {
      type: String,
      required: true,
      trim: true,
    },
    errorBody: {
        type: Object
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
    collection: "Logs",
  }
);

export default mongoose.model("Logs", logSchema);
