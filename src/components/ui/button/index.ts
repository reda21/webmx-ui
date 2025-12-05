import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                soft: '',
                outlined: 'border bg-transparent',
                subtle: '',
                ghost: 'bg-transparent',
                link: 'bg-transparent underline-offset-4 hover:underline',
            },
            severity: {
                secondary: '',
                success: '',
                info: '',
                warn: '',
                help: '',
                danger: '',
                contrast: '',
            },
            size: {
                xs: 'h-7 px-2.5 py-1 text-xs',
                sm: 'h-8 px-3.5 py-1.5 text-sm',
                md: 'h-10 px-5 py-2 text-sm',
                lg: 'h-12 px-7 py-3 text-base',
                xl: 'h-14 px-9 py-4 text-lg',
                '2xl': 'h-16 px-12 py-5 text-xl',
                icon: 'h-10 w-10',
            },
            rounded: {
                none: 'rounded-none',
                xs: 'rounded-sm',
                sm: 'rounded',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                '2xl': 'rounded-2xl',
                full: 'rounded-full',
            },
            iconPos: {
                left: 'flex-row',
                right: 'flex-row-reverse',
                top: 'flex-col',
                bottom: 'flex-col-reverse',
            },
            square: {
                true: 'aspect-square px-0',
            },
            raised: {
                true: 'shadow-md',
            },
        },
        compoundVariants: [
            // Soft variant combinations
            { variant: 'soft', severity: 'secondary', class: 'btn-soft-secondary' },
            { variant: 'soft', severity: 'success', class: 'btn-soft-success' },
            { variant: 'soft', severity: 'info', class: 'btn-soft-info' },
            { variant: 'soft', severity: 'warn', class: 'btn-soft-warn' },
            { variant: 'soft', severity: 'help', class: 'btn-soft-help' },
            { variant: 'soft', severity: 'danger', class: 'btn-soft-danger' },
            { variant: 'soft', severity: 'contrast', class: 'btn-soft-contrast' },

            // Outlined variant combinations
            { variant: 'outlined', severity: 'secondary', class: 'btn-outlined-secondary' },
            { variant: 'outlined', severity: 'success', class: 'btn-outlined-success' },
            { variant: 'outlined', severity: 'info', class: 'btn-outlined-info' },
            { variant: 'outlined', severity: 'warn', class: 'btn-outlined-warn' },
            { variant: 'outlined', severity: 'help', class: 'btn-outlined-help' },
            { variant: 'outlined', severity: 'danger', class: 'btn-outlined-danger' },
            { variant: 'outlined', severity: 'contrast', class: 'btn-outlined-contrast' },

            // Subtle variant combinations
            { variant: 'subtle', severity: 'secondary', class: 'btn-subtle-secondary' },
            { variant: 'subtle', severity: 'success', class: 'btn-subtle-success' },
            { variant: 'subtle', severity: 'info', class: 'btn-subtle-info' },
            { variant: 'subtle', severity: 'warn', class: 'btn-subtle-warn' },
            { variant: 'subtle', severity: 'help', class: 'btn-subtle-help' },
            { variant: 'subtle', severity: 'danger', class: 'btn-subtle-danger' },
            { variant: 'subtle', severity: 'contrast', class: 'btn-subtle-contrast' },

            // Ghost variant combinations
            { variant: 'ghost', severity: 'secondary', class: 'btn-ghost-secondary' },
            { variant: 'ghost', severity: 'success', class: 'btn-ghost-success' },
            { variant: 'ghost', severity: 'info', class: 'btn-ghost-info' },
            { variant: 'ghost', severity: 'warn', class: 'btn-ghost-warn' },
            { variant: 'ghost', severity: 'help', class: 'btn-ghost-help' },
            { variant: 'ghost', severity: 'danger', class: 'btn-ghost-danger' },
            { variant: 'ghost', severity: 'contrast', class: 'btn-ghost-contrast' },

            // Link variant combinations
            { variant: 'link', severity: 'secondary', class: 'btn-link-secondary' },
            { variant: 'link', severity: 'success', class: 'btn-link-success' },
            { variant: 'link', severity: 'info', class: 'btn-link-info' },
            { variant: 'link', severity: 'warn', class: 'btn-link-warn' },
            { variant: 'link', severity: 'help', class: 'btn-link-help' },
            { variant: 'link', severity: 'danger', class: 'btn-link-danger' },
            { variant: 'link', severity: 'contrast', class: 'btn-link-contrast' },
        ],
        defaultVariants: {
            variant: 'soft',
            severity: 'secondary',
            size: 'md',
            rounded: 'md',
            iconPos: 'left',
            square: false,
            raised: false,
        },
    },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
