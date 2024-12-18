import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTservices from "./jwt";

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub? : string;
    email: string;
    email_verified: string;
    azp?: string;
    name? : string;
    picture? : string;
    given_name: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid? : string;
    typ?:string;
}
    

class UserService {
    public static async verifyGoogleAuthToken(token: string) {
        const googleToken = token;
        const googleOauthURL = new URL('https://oauth2.googleapis.com/tokeninfo')
        googleOauthURL.searchParams.set('id_token', googleToken)
        const { data } = await axios.get<GoogleTokenResult>(googleOauthURL.toString(), {
            responseType: "json",
        })
        
        const user = await prismaClient.user.findUnique({
            where: {
                email: data.email,
            }
        })

        if (!user)
        {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageURL: data.picture
                }
                
            })
        }

        const userInDB = await prismaClient.user.findUnique({ where: { email: data.email } });
        if (!userInDB)
        {
            return new Error('User Not Found ');
        }
        const userToken = JWTservices.generateTokenForUser(userInDB);
        return userToken;
    }

    public static async getUserByID(id: string) {
        const user = await prismaClient.user.findUnique({ where: { id } });

        return user;
    }

    public static followUser(from: string, to: string) {
        return prismaClient.follows.create({
            data: {
                follower: { connect: { id: from } }, 
                following : {connect : {id : to}} , 
            }
        })
    }

    public static unFollowUser(from: string, to: string) {
        return prismaClient.follows.delete({
            where : {followerId_followingId : {followerId : from , followingId : to}}
        })
    }
}
export default UserService; 