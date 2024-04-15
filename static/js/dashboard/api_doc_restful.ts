import { SwaggerUIBundle } from 'swagger-ui-dist';

export default function onLoad() {
    SwaggerUIBundle({
        url: '/static/api_doc/restful.yaml',
        dom_id: '#swagger-ui',
    });
}


