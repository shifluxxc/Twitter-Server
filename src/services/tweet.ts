import { prismaClient } from "../clients/db";
import { redisClient } from "../clients/redis";

export interface CreateTweetPayload { 
    content : string 
    imageURL?: string 
}

class TweetServices {
    public static async getAllTweets() {
        const cachedTweets = await redisClient.get('ALL_TWEETS'); 
        if (cachedTweets)
        {
            return JSON.parse(cachedTweets); 
        }
        const tweets = await prismaClient.tweet.findMany({ orderBy: { createdAt: 'desc' } }); 
         await redisClient.set('ALL_TWEETS', JSON.stringify(tweets)); 
        return tweets; 
    }
    
    public static async CreateTweet(data : CreateTweetPayload , ID : string)
    {
        const createTweetFlag = await redisClient.get(`CREATE_TWEET_FLAG:${ID}`);
        if (createTweetFlag)
        {
            throw new Error('Please wait....'); 
        }
        const tweet = await prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data?.imageURL,

                author: { connect: { id: ID } }
            } , 
        });  
        await redisClient.setex(`CREATE_TWEET_FLAG:${ID}`, 10, 1); 
       await redisClient.del('ALL_TWEETS');
        return tweet; 
    }
}

export default TweetServices; 