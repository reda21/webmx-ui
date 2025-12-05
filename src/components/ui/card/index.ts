import { cva, type VariantProps } from 'class-variance-authority'

export const cardVariants = cva(
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    {
        variants: {
            severity: {
                secondary: 'border-secondary/20 bg-secondary/5',
                success: 'border-success/20 bg-success/5',
                info: 'border-info/20 bg-info/5',
                warn: 'border-warn/20 bg-warn/5',
                help: 'border-help/20 bg-help/5',
                danger: 'border-danger/20 bg-danger/5',
                contrast: 'border-contrast/20 bg-contrast/5',
            },
        },
        defaultVariants: {
            severity: undefined,
        },
    },
)

export type CardVariants = VariantProps<typeof cardVariants>

export { default as Card } from './Card.vue'
export { default as CardHeader } from './CardHeader.vue'
export { default as CardTitle } from './CardTitle.vue'
export { default as CardDescription } from './CardDescription.vue'
export { default as CardContent } from './CardContent.vue'
export { default as CardFooter } from './CardFooter.vue'
