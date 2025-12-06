import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        dts({
            tsconfigPath: './tsconfig.json',
            rollupTypes: true
        })
    ],
    resolve: {
        alias: {
            '~': resolve(__dirname, 'src'),
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'index.ts'),
            name: 'WebUI',
            fileName: 'web-ui',
        },
        rollupOptions: {
            external: ['vue', 'radix-vue', 'class-variance-authority', 'clsx', 'tailwind-merge', '@iconify/vue', 'vaul-vue', 'yup', 'zod', '@vuepic/vue-datepicker'],
            output: {
                globals: {
                    vue: 'Vue',
                    'radix-vue': 'RadixVue',
                    'class-variance-authority': 'classVarianceAuthority',
                    clsx: 'clsx',
                    'tailwind-merge': 'tailwindMerge',
                    '@iconify/vue': 'IconifyVue',
                    'vaul-vue': 'VaulVue',
                    yup: 'Yup',
                    zod: 'Zod',
                    '@vuepic/vue-datepicker': 'VueDatePicker',
                },
            },
        },
    },
})
