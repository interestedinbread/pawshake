"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
exports.db = {
    query: (text, params) => pool.query(text, params),
    pool,
};
//# sourceMappingURL=db.js.map