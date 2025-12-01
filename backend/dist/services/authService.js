"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const db_1 = require("../db/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const register = async (email, password) => {
    //    check if user exists
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db_1.db.query(query, [email]);
    if (result.rows.length > 0) {
        throw new Error('User already exists');
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const insertQuery = `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at`;
    const insertResult = await db_1.db.query(insertQuery, [email, passwordHash]);
    return insertResult.rows[0];
};
exports.register = register;
const login = async (email, password) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db_1.db.query(query, [email]);
    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    const user = result.rows[0];
    const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }
    const options = {
        expiresIn: env_1.env.jwtExpiresIn
    };
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, env_1.env.jwtSecret, options);
    return {
        user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
        },
        token
    };
};
exports.login = login;
//# sourceMappingURL=authService.js.map