"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisClient = new ioredis_1.default("rediss://default:AcpZAAIjcDFlMTVkZDM2YmRhOGY0MWY1YjY3NWVhMDY3MzI4MzJjOHAxMA@fond-salmon-51801.upstash.io:6379");
