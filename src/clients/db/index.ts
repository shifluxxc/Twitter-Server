import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient({log : ["query"]}); 
export const types = ` #graphql

type User {
    id : ID!
    firstName: String !
    lastName: String
    email: String!
    profileImageURL: String

    tweets : [Tweet]
}

`;
