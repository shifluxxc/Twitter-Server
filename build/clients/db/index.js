"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.prismaClient = void 0;
const client_1 = require("@prisma/client");
exports.prismaClient = new client_1.PrismaClient({ log: ["query"] });
exports.types = ` #graphql

type User {
    id : ID!
    firstName: String !
    lastName: String
    email: String!
    profileImageURL: String

    tweets : [Tweet]
}

`;
