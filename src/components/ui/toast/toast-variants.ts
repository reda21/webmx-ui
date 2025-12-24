import { type VariantProps, cva } from 'class-variance-authority'

export const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
    {
        variants: {
            severity: {
                default: 'border bg-background text-foreground',
                secondary: 'toast-secondary',
                success: 'toast-success',
                info: 'toast-info',
                warn: 'toast-warn',
                help: 'toast-help',
                danger: 'toast-danger',
                contrast: 'toast-contrast',
            },
        },
        defaultVariants: {
            severity: 'default',
        },
    },
)

export const toastViewportVariants = cva(
    'fixed z-100 flex max-h-screen w-full flex-col gap-2 p-4 md:max-w-[420px]',
    {
        variants: {
            position: {
                'top-left': 'top-0 left-0 flex-col',
                'top-center': 'top-0 left-1/2 -translate-x-1/2 flex-col',
                'top-right': 'top-0 right-0 flex-col',
                'bottom-left': 'bottom-0 left-0 flex-col-reverse',
                'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse',
                'bottom-right': 'bottom-0 right-0 flex-col-reverse',
            },
        },
        defaultVariants: {
            position: 'bottom-right',
        },
    },
)

export type ToastVariants = VariantProps<typeof toastVariants>
export type ToastViewportVariants = VariantProps<typeof toastViewportVariants>
