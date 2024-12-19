import { Tweet } from "@prisma/client"
import { prismaClient } from "../../clients/db"
import { GraphqlContext } from "../../interfaces"
import TweetServices from "../../services/tweet"
import { redisClient } from "../../clients/redis"

interface CreateTweetPayload { 
    content : string 
    imageURL ?: string 
}

const queries = {
    getAllTweets: async () => await TweetServices.getAllTweets()
}

const mutations = {
    createTweet: async (parent : any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {
        if (!ctx.user) throw new Error("You are not authenticated ")
        const tweet = TweetServices.CreateTweet(payload, ctx.user.id); 
        return tweet; 
    }
}

const resolverForAuthor = {
    Tweet: {
        author:  async (parent: Tweet) => 
          await prismaClient.user.findUnique({ where: { id: parent.authorld } }), 
        },
}; 

export const resolvers = { mutations , resolverForAuthor , queries}; 
