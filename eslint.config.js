// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ["static/js/**/*.js", "static/js/**/*.ts"],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    project: true,
                    tsconfigRootDir: import.meta.dirname,
                },
            },
        },
    ]
});
