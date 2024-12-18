import {  User } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";
import { redisClient } from "../../clients/redis";
import { json } from "body-parser";


const queries = {
    verifyGoogleToken:
        async (parent: any, { token }: { token: string }) => {
            const Finaltoken = await UserService.verifyGoogleAuthToken(token); 
            return Finaltoken; 
        },
    
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
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
            prismaClient.tweet.findMany({ where: { authorld: parent.id } }), 
        
        follower: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: {
                    follower: true,
                },
            });

            return result.map((el) => el.follower); 
        }, 
        
        following : async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    following: true,
                },
            });

            return result.map((el) => el.following); 
        }, 
     
        recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
            if (!ctx.user) return []; 
            const cachedValue = await redisClient.get(`RECOMMENDED_USER:${ctx.user.id}`);
            if (cachedValue)
            {  return JSON.parse(cachedValue); } 
            const myFollowing = await prismaClient.follows.findMany({
                where: { followerId: ctx.user.id },
                include: { following: { include: { follower: {include : {following : true}} } } } , 
            })

            const r_users: User[] = []; 
            for (const followings of myFollowing)
            {
                for (const followingOfFollowedUser of followings.following.follower)
                {
                    if (followingOfFollowedUser.following.id !== ctx.user.id && (myFollowing.findIndex((e) => e.followingId === followingOfFollowedUser.following.id) < 0))
                    {
                        r_users.push(followingOfFollowedUser.following)
                    }
                }
            }

            await redisClient.set(`RECOMMENDED_USER:${ctx.user.id}`, JSON.stringify(r_users)); 
            return r_users; 
        } , 
    } , 
}

const mutations = {
    followUser: async (parent : any , {to} : {to : string} , ctx : GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error('Unauthenticated')
        
        await UserService.followUser(ctx.user.id, to); 
        await redisClient.del(`RECOMMENDED_USER:${ctx.user.id}`); 
        return true; 
    } , 

    unFollowUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error('Unauthenticated')
        
        await UserService.unFollowUser(ctx.user.id, to); 
        await redisClient.del(`RECOMMENDED_USER:${ctx.user.id}`); 
    } , 
}
export const resolvers = { queries , resolverForTweets , mutations } ;