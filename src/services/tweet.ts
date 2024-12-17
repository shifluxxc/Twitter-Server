import { prismaClient } from "../clients/db";

export interface CreateTweetPayload { 
    content : string 
    imageURL?: string 
    userId : string 
}

class TweetServices {
   
}

export default TweetServices; 