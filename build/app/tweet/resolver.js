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
const tweet_1 = __importDefault(require("../../services/tweet"));
const queries = {
    getAllTweets: () => __awaiter(void 0, void 0, void 0, function* () { return yield tweet_1.default.getAllTweets(); })
};
const mutations = {
    createTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { payload }, ctx) {
        if (!ctx.user)
            throw new Error("You are not authenticated ");
        const tweet = tweet_1.default.CreateTweet(payload, ctx.user.id);
        return tweet;
    })
};
const resolverForAuthor = {
    Tweet: {
        author: (parent) => __awaiter(void 0, void 0, void 0, function* () { return yield db_1.prismaClient.user.findUnique({ where: { id: parent.authorld } }); }),
    },
};
exports.resolvers = { mutations, resolverForAuthor, queries };
