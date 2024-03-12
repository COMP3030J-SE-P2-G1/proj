import {Resolver} from '@parcel/plugin';

export default new Resolver({
    async resolve({specifier}) {
        // don't handle jinja code
        if (/\s*{[{%].*[%}]}\s*/.test(specifier)) {
            return {isExcluded: true};
        }

        // Let the next resolver in the pipeline handle
        // this dependency.
        return null;
    }
});
