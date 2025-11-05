"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = require("../db/connection");
const User_1 = require("../models/User");
async function main() {
    await (0, connection_1.connectToDatabase)();
    const email = process.env.ADMIN_EMAIL || 'admin@trendlytic.local';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const existing = await User_1.UserModel.findOne({ email });
    if (existing) {
        // eslint-disable-next-line no-console
        console.log('Admin already exists:', email);
        process.exit(0);
    }
    const password_hash = await bcryptjs_1.default.hash(password, 10);
    await User_1.UserModel.create({ email, password_hash, role: 'admin', name: 'Administrator' });
    // eslint-disable-next-line no-console
    console.log('Admin created:', email);
    process.exit(0);
}
main().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});
