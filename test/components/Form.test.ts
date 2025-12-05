import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, inject } from 'vue'
import Form from '../../src/components/ui/form/Form.vue'
import { useForm } from '../../src/composables/useForm'

describe('Form Component', () => {
    describe('Rendering', () => {
        it('should render form element', () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const wrapper = mount(Form, {
                props: { form },
            })

            expect(wrapper.find('form').exists()).toBe(true)
        })

        it('should render slot content', () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const wrapper = mount(Form, {
                props: { form },
                slots: {
                    default: '<div class="test-content">Form Content</div>',
                },
            })

            expect(wrapper.find('.test-content').exists()).toBe(true)
            expect(wrapper.text()).toContain('Form Content')
        })
    })

    describe('Form Context', () => {
        it('should provide form context to child components', () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            let providedForm: any = null

            const ChildComponent = {
                setup() {
                    providedForm = inject('formContext')
                    return () => h('div', 'child')
                },
            }

            mount(Form, {
                props: { form },
                slots: {
                    default: h(ChildComponent),
                },
            })

            expect(providedForm).toBeTruthy()
            expect(providedForm.values.value.name).toBe('John')
        })
    })

    describe('Form Submission', () => {
        it('should call handleSubmit on form submit', async () => {
            const onSubmit = vi.fn()
            const form = useForm({
                initialValues: { name: 'John' },
                onSubmit,
            })

            const wrapper = mount(Form, {
                props: { form },
            })

            await wrapper.find('form').trigger('submit')
            // Wait for async validation to complete
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(onSubmit).toHaveBeenCalled()
        })

        it('should handle form submission with validation errors', async () => {
            const form = useForm({
                schema: {
                    email: [
                        { type: 'required', message: 'Email required' },
                        { type: 'email', message: 'Invalid email' },
                    ],
                },
                initialValues: { email: '' },
            })

            const wrapper = mount(Form, {
                props: { form },
            })

            await wrapper.find('form').trigger('submit')
            // Wait for async validation to complete
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(form.errors.value.email).toBeDefined()
            expect(form.errors.value.email[0]).toBe('Email required')
        })

        it('should update submitCount after submission', async () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            const wrapper = mount(Form, {
                props: { form },
            })

            expect(form.meta.value.submitCount).toBe(0)

            await wrapper.find('form').trigger('submit')
            // Wait for async validation to complete
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(form.meta.value.submitCount).toBe(1)
        })
    })

    describe('Internal Form Creation', () => {
        it('should create internal form when no form prop is provided', () => {
            const wrapper = mount(Form, {
                props: {
                    validationSchema: {
                        name: [{ type: 'required', message: 'Required' }],
                    },
                    initialValues: { name: '' },
                },
            })

            expect(wrapper.find('form').exists()).toBe(true)
        })

        it('should expose form state via slot props', () => {
            let slotValues: any = null
            let slotErrors: any = null

            mount(Form, {
                props: {
                    initialValues: { name: 'Test' },
                },
                slots: {
                    default: (props: any) => {
                        slotValues = props.values
                        slotErrors = props.errors
                        return h('div', 'content')
                    },
                },
            })

            expect(slotValues).toBeDefined()
            expect(slotValues.name).toBe('Test')
            expect(slotErrors).toBeDefined()
        })

        it('should expose form methods via slot props', () => {
            let slotProps: any = null

            mount(Form, {
                props: {
                    initialValues: { name: '' },
                },
                slots: {
                    default: (props: any) => {
                        slotProps = props
                        return h('div', 'content')
                    },
                },
            })

            expect(typeof slotProps.setFieldValue).toBe('function')
            expect(typeof slotProps.setFieldError).toBe('function')
            expect(typeof slotProps.resetForm).toBe('function')
            expect(typeof slotProps.validate).toBe('function')
        })
    })

    describe('Integration', () => {
        it('should work with complete form workflow', async () => {
            const onSubmit = vi.fn()
            const form = useForm({
                schema: {
                    name: [
                        { type: 'required', message: 'Name is required' },
                        { type: 'minLength', value: 3, message: 'Min 3 chars' },
                    ],
                },
                initialValues: { name: '' },
                onSubmit,
            })

            const wrapper = mount(Form, {
                props: { form },
                slots: {
                    default: '<input type="text" />',
                },
            })

            // Initially should not submit with empty value
            await wrapper.find('form').trigger('submit')
            await new Promise(resolve => setTimeout(resolve, 10))
            expect(onSubmit).not.toHaveBeenCalled()
            expect(form.errors.value.name).toEqual(['Name is required'])

            // Update value
            form.setFieldValue('name', 'Jo')
            await wrapper.find('form').trigger('submit')
            await new Promise(resolve => setTimeout(resolve, 10))
            expect(onSubmit).not.toHaveBeenCalled()
            expect(form.errors.value.name).toEqual(['Min 3 chars'])

            // Valid submission
            form.setFieldValue('name', 'John')
            await wrapper.find('form').trigger('submit')
            await new Promise(resolve => setTimeout(resolve, 10))
            expect(onSubmit).toHaveBeenCalled()
        })

        it('should handle async submission', async () => {
            const onSubmit = vi.fn(
                () => new Promise<void>((resolve) => setTimeout(resolve, 50)) // Explicitly return Promise<void>
            )
            const form = useForm({
                initialValues: { name: 'John' },
                onSubmit,
            })

            const wrapper = mount(Form, {
                props: { form },
            })

            // Trigger submit without awaiting
            const submitPromise = wrapper.find('form').trigger('submit')

            // Wait a bit for the submit handler to start
            await new Promise(resolve => setTimeout(resolve, 5))

            // Should be submitting
            expect(form.meta.value.isSubmitting).toBe(true)

            // Wait for submission to complete
            await submitPromise
            await new Promise(resolve => setTimeout(resolve, 60))

            // Should be done submitting
            expect(form.meta.value.isSubmitting).toBe(false)
            expect(onSubmit).toHaveBeenCalled()
        })

        it('should reset form correctly', async () => {
            const initialValues = { name: 'John', email: 'john@example.com' }
            const form = useForm({ initialValues })

            mount(Form, {
                props: { form },
            })

            // Modify form
            form.setFieldValue('name', 'Jane')
            form.setFieldError('email', 'Invalid email')

            expect(form.values.value.name).toBe('Jane')
            expect(form.errors.value.email).toBeDefined()

            // Reset
            form.resetForm()

            expect(form.values.value).toEqual(initialValues)
            expect(form.errors.value).toEqual({})
        })
    })
})
