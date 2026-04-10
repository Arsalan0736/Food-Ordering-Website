import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || "http://localhost:3005/graphql",
  fetchOptions: { cache: "no-store" },
});

export const getApolloClient = (userId: string) => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        "user-id": userId,
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
             restaurants: { merge: false },
             orders: { merge: false }
          }
        }
      }
    }),
  });
};
