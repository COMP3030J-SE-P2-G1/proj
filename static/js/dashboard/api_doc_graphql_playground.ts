import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import { createRoot } from 'react-dom/client';


export default function onLoad() {
    const fetcher = createGraphiQLFetcher({ url: '/api/graphql' });

    const root = createRoot(document.getElementById('graphql-playground'));
    root.render(React.createElement(GraphiQL, {
        fetcher: fetcher,
        defaultQuery: `# Graphql functionality is completed. Try out this example!
{
  me {
    profiles {
      usage(
        start_time: "2023-1-31T23:00:00.000Z"
        end_time: "2023-2-26T23:00:00.000Z"
        aggregate: day
      )
    }
  }
}
`
    }));
}


