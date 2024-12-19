"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const user_1 = __importDefault(require("../../services/user"));
const redis_1 = require("../../clients/redis");
const queries = {
    verifyGoogleToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        const Finaltoken = yield user_1.default.verifyGoogleAuthToken(token);
        return Finaltoken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            return null;
        }
        const user = user_1.default.getUserByID(id);
        return user;
    }),
    getUserById: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { id }, ctx) {
        const user = user_1.default.getUserByID(id);
        return user;
    })
};
const resolverForTweets = {
    User: {
        tweets: (parent) => db_1.prismaClient.tweet.findMany({ where: { authorld: parent.id } }),
        follower: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: {
                    follower: true,
                },
            });
            return result.map((el) => el.follower);
        }),
        following: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    following: true,
                },
            });
            return result.map((el) => el.following);
        }),
        recommendedUsers: (parent, _, ctx) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ctx.user)
                return [];
            const cachedValue = yield redis_1.redisClient.get(`RECOMMENDED_USER:${ctx.user.id}`);
            if (cachedValue) {
                return JSON.parse(cachedValue);
            }
            const myFollowing = yield db_1.prismaClient.follows.findMany({
                where: { followerId: ctx.user.id },
                include: { following: { include: { follower: { include: { following: true } } } } },
            });
            const r_users = [];
            for (const followings of myFollowing) {
                for (const followingOfFollowedUser of followings.following.follower) {
                    if (followingOfFollowedUser.following.id !== ctx.user.id && (myFollowing.findIndex((e) => e.followingId === followingOfFollowedUser.following.id) < 0)) {
                        r_users.push(followingOfFollowedUser.following);
                    }
                }
            }
            yield redis_1.redisClient.set(`RECOMMENDED_USER:${ctx.user.id}`, JSON.stringify(r_users));
            return r_users;
        }),
    },
};
const mutations = {
    followUser: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthenticated');
        yield user_1.default.followUser(ctx.user.id, to);
        yield redis_1.redisClient.del(`RECOMMENDED_USER:${ctx.user.id}`);
        return true;
    }),
    unFollowUser: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { to }, ctx) {
        if (!ctx.user || !ctx.user.id)
            throw new Error('Unauthenticated');
        yield user_1.default.unFollowUser(ctx.user.id, to);
        yield redis_1.redisClient.del(`RECOMMENDED_USER:${ctx.user.id}`);
    }),
};
exports.resolvers = { queries, resolverForTweets, mutations };
