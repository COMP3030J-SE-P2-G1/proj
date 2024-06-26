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
    ],
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off"
    }
});
