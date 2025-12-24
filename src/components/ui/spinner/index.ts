import { type VariantProps, cva } from 'class-variance-authority'

export { default as Spinner } from './Spinner.vue'

export const spinnerVariants = cva(
  'animate-spin text-muted-foreground',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: '',
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

export type SpinnerVariants = VariantProps<typeof spinnerVariants>
