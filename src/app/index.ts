import express from "express"; 
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4"; 
import cors from "cors" 
import { User } from "./user";
import { Tweet } from "./tweet";
import { GraphqlContext } from "../interfaces";
import JWTservices from "../services/jwt";
export async function initServer() {
    const app = express();
    app.use(bodyParser.json()); 
    app.use(cors()); 
    const graphqlServer = new ApolloServer<GraphqlContext>({

        typeDefs: `
        ${User.types}
        ${Tweet.types} 
        type Query {
        ${User.queries}
        ${Tweet.queries}
        }

        type Mutation {
        ${Tweet.mutations}
        ${User.mutations} 
        }
        `,
        resolvers: {
            Query: {
                ...User.resolvers.queries, 
                ...Tweet.resolvers.queries 
            }, 
            
            Mutation: {
                ...Tweet.resolvers.mutations, 
                ...User.resolvers.mutations, 
            },
            ...Tweet.resolvers.resolverForAuthor, 
            ...User.resolvers.resolverForTweets , 
        }, 
    })

    await graphqlServer.start(); 

    app.use('/graphql', expressMiddleware(graphqlServer, {
        context: async ({ req, res }) => {
            return {
                user: req.headers.authorization ? JWTservices.decodeToken(req.headers.authorization.split(' ')[1]) : undefined , 
            }; 
        } , 
    })); 

    return app; 
    
}