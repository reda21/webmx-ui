import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '../../src/components/ui/form/FormField.vue'
import { useForm } from '../../src/composables/useForm'

describe('FormField Component', () => {
    const createWrapper = (formOptions = {}, props = {}) => {
        const form = useForm({
            initialValues: { name: '' },
            ...formOptions,
        })

        return mount(FormField, {
            props: {
                name: 'name',
                ...props,
            },
            global: {
                provide: {
                    formContext: form,
                },
            },
        })
    }

    describe('Rendering', () => {
        it('should render wrapper div', () => {
            const wrapper = createWrapper()
            expect(wrapper.find('div.flex.flex-col.gap-2').exists()).toBe(true)
        })

        it('should render slot content', () => {
            const form = useForm({ initialValues: { email: '' } })

            const wrapper = mount(FormField, {
                props: { name: 'email' },
                slots: {
                    default: '<input type="email" />',
                },
                global: {
                    provide: {
                        formContext: form,
                    },
                },
            })

            expect(wrapper.find('input[type="email"]').exists()).toBe(true)
        })

        it('should render label when provided', () => {
            const wrapper = createWrapper({}, { name: 'name', label: 'Full Name' })
            expect(wrapper.text()).toContain('Full Name')
        })

        it('should not render label when not provided', () => {
            const wrapper = createWrapper({}, { name: 'name' })
            expect(wrapper.find('label').exists()).toBe(false)
        })
    })

    describe('Props', () => {
        it('should accept name prop', () => {
            const wrapper = createWrapper({}, { name: 'email' })
            expect(wrapper.props('name')).toBe('email')
        })

        it('should work gracefully without form context', () => {
            // With the updated FormField, it should not throw but gracefully handle missing context
            const wrapper = mount(FormField, {
                props: { name: 'name' },
            })
            expect(wrapper.exists()).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should reflect field errors from form', async () => {
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Required' }],
                },
                initialValues: { name: '' },
            })

            mount(FormField, {
                props: { name: 'name' },
                global: {
                    provide: {
                        formContext: form,
                    },
                },
            })

            // Initially no error
            expect(form.getFieldError('name')).toBeUndefined()

            // Set error
            form.setFieldError('name', 'Required')

            // Error should be accessible via form
            expect(form.getFieldError('name')).toBe('Required')
        })

        it('should update error when field validation runs', async () => {
            const form = useForm({
                schema: {
                    email: [
                        { type: 'required', message: 'Email required' },
                        { type: 'email', message: 'Invalid email' },
                    ],
                },
                initialValues: { email: '' },
            })

            mount(FormField, {
                props: { name: 'email' },
                global: {
                    provide: {
                        formContext: form,
                    },
                },
            })

            await form.validateField('email')
            expect(form.getFieldError('email')).toBe('Email required')

            form.setFieldValue('email', 'invalid')
            await form.validateField('email')
            expect(form.getFieldError('email')).toBe('Invalid email')

            form.setFieldValue('email', 'test@example.com')
            await form.validateField('email')
            expect(form.getFieldError('email')).toBeUndefined()
        })
    })

    describe('Integration', () => {
        it('should work with form validation workflow', async () => {
            const form = useForm({
                schema: {
                    username: [
                        { type: 'required', message: 'Username required' },
                        { type: 'minLength', value: 3, message: 'Min 3 characters' },
                    ],
                },
                initialValues: { username: '' },
            })

            mount(FormField, {
                props: { name: 'username' },
                global: {
                    provide: {
                        formContext: form,
                    },
                },
            })

            // Validate empty field
            await form.validateField('username')
            expect(form.getFieldError('username')).toBe('Username required')

            // Set short value
            form.setFieldValue('username', 'ab')
            await form.validateField('username')
            expect(form.getFieldError('username')).toBe('Min 3 characters')

            // Set valid value
            form.setFieldValue('username', 'john')
            await form.validateField('username')
            expect(form.getFieldError('username')).toBeUndefined()
        })
    })

    describe('Context Provision', () => {
        it('should provide validateOn context', () => {
            const wrapper = createWrapper({}, { name: 'test', validateOn: 'blur' })
            // The validateOn should be provided to children
            expect(wrapper.props('validateOn')).toBe('blur')
        })

        it('should provide fieldName to children', () => {
            const wrapper = createWrapper({}, { name: 'testField' })
            expect(wrapper.props('name')).toBe('testField')
        })
    })
})
