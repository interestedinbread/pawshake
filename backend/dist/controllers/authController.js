"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const authService_1 = require("../services/authService");
const registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await (0, authService_1.register)(email, password);
        res.status(201).json({ user });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'User already exists') {
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const result = await (0, authService_1.login)(email, password);
        return res.status(200).json({ user: result.user, token: result.token });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=authController.js.map