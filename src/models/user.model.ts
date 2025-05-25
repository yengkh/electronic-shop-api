import { UserInterface } from "@/types/user.interface";
import { Model, Schema } from "mongoose";

const UserSchema = new Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    avatar: {
      url: {
        type: String,
        required: false,
        default: "",
      },
      altText: {
        type: String,
        default: "",
      },
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Users = (mongoose: typeof import("mongoose")): Model<UserInterface> => {
  return (
    mongoose.models?.Users || mongoose.model<UserInterface>("Users", UserSchema)
  );
};

export default Users;
