import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import FormMessage from '../../src/components/ui/form/FormMessage.vue'
import { useForm } from '../../src/composables/useForm'

describe('FormMessage Component', () => {
    describe('Rendering', () => {
        it('should not render when no error', () => {
            const wrapper = mount(FormMessage, {
                global: {
                    provide: {
                        fieldError: computed(() => undefined),
                    },
                },
            })

            expect(wrapper.find('p').exists()).toBe(false)
        })

        it('should render error message from injected fieldError', () => {
            const wrapper = mount(FormMessage, {
                global: {
                    provide: {
                        fieldError: computed(() => 'This field is required'),
                    },
                },
            })

            expect(wrapper.find('p').exists()).toBe(true)
            expect(wrapper.text()).toContain('This field is required')
        })

        it('should render error message from prop', () => {
            const wrapper = mount(FormMessage, {
                props: {
                    error: 'Custom error message',
                },
            })

            expect(wrapper.find('p').exists()).toBe(true)
            expect(wrapper.text()).toContain('Custom error message')
        })

        it('should prefer prop error over injected error', () => {
            const wrapper = mount(FormMessage, {
                props: {
                    error: 'Prop error',
                },
                global: {
                    provide: {
                        fieldError: computed(() => 'Injected error'),
                    },
                },
            })

            expect(wrapper.text()).toContain('Prop error')
            expect(wrapper.text()).not.toContain('Injected error')
        })
    })

    describe('Styling', () => {
        it('should have destructive text color class', () => {
            const wrapper = mount(FormMessage, {
                props: {
                    error: 'Error',
                },
            })

            expect(wrapper.find('p').classes()).toContain('text-destructive')
        })

        it('should have text-sm and font-medium classes', () => {
            const wrapper = mount(FormMessage, {
                props: {
                    error: 'Error',
                },
            })

            expect(wrapper.find('p').classes()).toContain('text-sm')
            expect(wrapper.find('p').classes()).toContain('font-medium')
        })

        it('should accept custom class prop', () => {
            const wrapper = mount(FormMessage, {
                props: {
                    error: 'Error',
                    class: 'custom-class',
                },
            })

            expect(wrapper.find('p').classes()).toContain('custom-class')
        })
    })

    describe('Integration with FormField', () => {
        it('should display error when form validation fails', async () => {
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Name is required' }],
                },
                initialValues: { name: '' },
            })

            // Validate the field to generate an error
            await form.validateField('name')

            const wrapper = mount(FormMessage, {
                global: {
                    provide: {
                        fieldError: computed(() => form.getFieldError('name')),
                    },
                },
            })

            expect(wrapper.find('p').exists()).toBe(true)
            expect(wrapper.text()).toContain('Name is required')
        })

        it('should update when error changes', async () => {
            const form = useForm({
                schema: {
                    email: [
                        { type: 'required', message: 'Required' },
                        { type: 'email', message: 'Invalid email' },
                    ],
                },
                initialValues: { email: '' },
            })

            const fieldError = computed(() => form.getFieldError('email'))

            const wrapper = mount(FormMessage, {
                global: {
                    provide: {
                        fieldError,
                    },
                },
            })

            // Initially no error shown yet
            expect(wrapper.find('p').exists()).toBe(false)

            // Validate empty field
            await form.validateField('email')
            await wrapper.vm.$nextTick()

            expect(wrapper.text()).toContain('Required')

            // Set invalid email
            form.setFieldValue('email', 'invalid')
            await form.validateField('email')
            await wrapper.vm.$nextTick()

            expect(wrapper.text()).toContain('Invalid email')

            // Set valid email
            form.setFieldValue('email', 'test@example.com')
            await form.validateField('email')
            await wrapper.vm.$nextTick()

            expect(wrapper.find('p').exists()).toBe(false)
        })
    })
})
