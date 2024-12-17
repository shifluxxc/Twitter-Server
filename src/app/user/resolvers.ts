import {  User } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";


const queries = {
    verifyGoogleToken:
        async (parent: any, { token }: { token: string }) => {
            const Finaltoken = await UserService.verifyGoogleAuthToken(token); 
            return Finaltoken; 
        },
    
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        console.log(ctx);
        const id = ctx.user?.id; 
        if (!id)
        {
            return null; 
        }

        const user = UserService.getUserByID(id); 
        return user ; 
    } ,

    getUserById: async (parent: any, { id } : { id: string }, ctx: GraphqlContext) =>{
        const user = UserService.getUserByID(id); 
        return user; 
    }
}; 

const resolverForTweets = {
    User: {
        tweets: (parent: User) => 
            prismaClient.tweet.findMany({ where: { authorld: parent.id } }) ,  
    }
}
export const resolvers = { queries , resolverForTweets } ;