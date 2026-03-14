import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  bio: string;
  connectedExchanges: { exchange: string; connected: boolean; apiKey: string; apiSecret: string }[];
}

const ConnectedExchangeSchema = new Schema(
  {
    exchange: { type: String, required: true },
    connected: { type: Boolean, default: false },
    apiKey: { type: String, default: "" },
    apiSecret: { type: String, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    connectedExchanges: {
      type: [ConnectedExchangeSchema],
      default: [
        { exchange: "Hyperliquid", connected: false },
        { exchange: "Backpack", connected: false },
        { exchange: "Lighter", connected: false },
      ],
    },
  },
  { timestamps: true }
);

// Transform _id → id in JSON responses
UserSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    if (ret.connectedExchanges) {
      ret.connectedExchanges = ret.connectedExchanges.map((ex: any) => ({
        ...ex,
        apiKey: ex.apiKey ? "••••" + ex.apiKey.slice(-4) : "",
        apiSecret: ex.apiSecret ? "••••" + ex.apiSecret.slice(-4) : "",
      }));
    }
    return ret;
  },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
