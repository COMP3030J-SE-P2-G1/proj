import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import { createRoot } from 'react-dom/client';


export default function onLoad() {
    const fetcher = createGraphiQLFetcher({ url: 'https://countries.trevorblades.com/' });

    const root = createRoot(document.getElementById('graphql-playground'));
    root.render(React.createElement(GraphiQL, {
        fetcher: fetcher,
        defaultQuery: ` # Experimental
query {
    countries {
        name
    }
}
`
    }));
}


