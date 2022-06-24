import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'client/main.js',
    output: {
        format: 'es',
        file: 'server/wwwroot/scripts/bundle.js'
    },
    plugins: [
        svelte({
            emitCss: false
        }),
        resolve({
            browser: true
        })
    ]
}
