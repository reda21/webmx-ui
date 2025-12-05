import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useForm, type UseFormReturn, type ValidationRule } from '../../src/composables/useForm'
import { z } from 'zod'

describe('useForm', () => {
    describe('Initialization', () => {
        it('should initialize with default values', () => {
            const form = useForm({
                initialValues: {
                    name: 'John',
                    email: 'john@example.com',
                },
            })

            expect(form.values.value.name).toBe('John')
            expect(form.values.value.email).toBe('john@example.com')
            expect(form.errors.value).toEqual({})
            expect(form.meta.value.isSubmitting).toBe(false)
            expect(form.meta.value.submitCount).toBe(0)
        })

        it('should initialize with empty object if no initial values provided', () => {
            const form = useForm()

            expect(form.values.value).toEqual({})
        })
    })

    describe('Field Value Management', () => {
        let form: UseFormReturn

        beforeEach(() => {
            form = useForm({
                initialValues: { name: '', email: '' },
            })
        })

        it('should set field value', () => {
            form.setFieldValue('name', 'John')

            expect(form.values.value.name).toBe('John')
        })

        it('should mark field as dirty when value is set', () => {
            form.setFieldValue('name', 'John')

            expect(form.fieldsMeta.value.name?.dirty).toBe(true)
        })

        it('should get field error', () => {
            form.setFieldError('name', 'Name is required')

            expect(form.getFieldError('name')).toBe('Name is required')
        })

        it('should return undefined if field has no error', () => {
            expect(form.getFieldError('name')).toBeUndefined()
        })

        it('should get field meta', () => {
            const meta = form.getFieldMeta('name')

            expect(meta).toHaveProperty('touched')
            expect(meta).toHaveProperty('dirty')
        })

        it('should set server errors', () => {
            form.setServerErrors({
                name: ['Name is required'],
                email: ['Email is invalid'],
            })

            expect(form.errors.value.name).toEqual(['Name is required'])
            expect(form.errors.value.email).toEqual(['Email is invalid'])
        })
    })

    describe('Validation with Rules', () => {
        it('should validate required field', async () => {
            const rules: ValidationRule[] = [
                { type: 'required', message: 'Name is required' },
            ]

            const form = useForm({
                schema: { name: rules },
                initialValues: { name: '' },
            })

            const result = await form.validateField('name', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('name')).toBe('Name is required')
        })

        it('should validate email format', async () => {
            const rules: ValidationRule[] = [
                { type: 'email', message: 'Invalid email format' },
            ]

            const form = useForm({
                schema: { email: rules },
                initialValues: { email: 'invalid-email' },
            })

            const result = await form.validateField('email', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('email')).toBe('Invalid email format')
        })

        it('should pass email validation with valid email', async () => {
            const rules: ValidationRule[] = [
                { type: 'email', message: 'Invalid email format' },
            ]

            const form = useForm({
                schema: { email: rules },
                initialValues: { email: 'test@example.com' },
            })

            const result = await form.validateField('email', rules)

            expect(result.valid).toBe(true)
            expect(form.getFieldError('email')).toBeUndefined()
        })

        it('should validate minLength', async () => {
            const rules: ValidationRule[] = [
                { type: 'minLength', value: 3, message: 'Min 3 characters' },
            ]

            const form = useForm({
                schema: { name: rules },
                initialValues: { name: 'Jo' },
            })

            const result = await form.validateField('name', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('name')).toBe('Min 3 characters')
        })

        it('should validate maxLength', async () => {
            const rules: ValidationRule[] = [
                { type: 'maxLength', value: 5, message: 'Max 5 characters' },
            ]

            const form = useForm({
                schema: { name: rules },
                initialValues: { name: 'Jonathan' },
            })

            const result = await form.validateField('name', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('name')).toBe('Max 5 characters')
        })

        it('should validate min number', async () => {
            const rules: ValidationRule[] = [
                { type: 'min', value: 18, message: 'Must be at least 18' },
            ]

            const form = useForm({
                schema: { age: rules },
                initialValues: { age: 15 },
            })

            const result = await form.validateField('age', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('age')).toBe('Must be at least 18')
        })

        it('should validate max number', async () => {
            const rules: ValidationRule[] = [
                { type: 'max', value: 100, message: 'Must be at most 100' },
            ]

            const form = useForm({
                schema: { age: rules },
                initialValues: { age: 150 },
            })

            const result = await form.validateField('age', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('age')).toBe('Must be at most 100')
        })

        it('should validate pattern', async () => {
            const rules: ValidationRule[] = [
                {
                    type: 'pattern',
                    value: /^[A-Z]/,
                    message: 'Must start with uppercase',
                },
            ]

            const form = useForm({
                schema: { name: rules },
                initialValues: { name: 'john' },
            })

            const result = await form.validateField('name', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('name')).toBe('Must start with uppercase')
        })

        it('should validate custom rule', async () => {
            const rules: ValidationRule[] = [
                {
                    type: 'custom',
                    value: (val: string) => val.includes('test'),
                    message: 'Must contain "test"',
                },
            ]

            const form = useForm({
                schema: { name: rules },
                initialValues: { name: 'john' },
            })

            const result = await form.validateField('name', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('name')).toBe('Must contain "test"')
        })

        it('should validate entire form with rules', async () => {
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Name required' }],
                    email: [
                        { type: 'required', message: 'Email required' },
                        { type: 'email', message: 'Invalid email' },
                    ],
                },
                initialValues: { name: '', email: 'invalid' },
            })

            const result = await form.validate()

            expect(result.valid).toBe(false)
            expect(form.errors.value.name).toEqual(['Name required'])
            expect(form.errors.value.email).toEqual(['Invalid email'])
        })
    })

    describe('Validation with Zod Schema', () => {
        it('should validate with Zod schema', async () => {
            const schema = z.object({
                name: z.string().min(3, 'Name must be at least 3 characters'),
                email: z.string().email('Invalid email'),
            })

            const form = useForm({
                schema,
                initialValues: { name: 'Jo', email: 'invalid' },
            })

            const result = await form.validate()

            expect(result.valid).toBe(false)
            expect(form.errors.value.name).toBeDefined()
            expect(form.errors.value.email).toBeDefined()
        })

        it('should pass validation with valid Zod data', async () => {
            const schema = z.object({
                name: z.string().min(3),
                email: z.string().email(),
            })

            const form = useForm({
                schema,
                initialValues: { name: 'John', email: 'john@example.com' },
            })

            const result = await form.validate()

            expect(result.valid).toBe(true)
            expect(form.errors.value).toEqual({})
        })

        it('should validate single field with Zod schema', async () => {
            const schema = z.object({
                name: z.string().min(3, 'Minimum 3 characters'),
            })

            const form = useForm({
                schema,
                initialValues: { name: 'Jo' },
            })

            const result = await form.validateField('name')

            expect(result.valid).toBe(false)
        })
    })

    describe('Form Submission', () => {
        it('should call onSubmit when form is valid', async () => {
            const onSubmit = vi.fn()
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Name required' }],
                },
                initialValues: { name: 'John' },
                onSubmit,
            })

            const handleSubmit = form.handleSubmit()
            await handleSubmit()

            expect(onSubmit).toHaveBeenCalled()
            expect(form.meta.value.submitCount).toBe(1)
        })

        it('should not call onSubmit when form is invalid', async () => {
            const onSubmit = vi.fn()
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Name required' }],
                },
                initialValues: { name: '' },
                onSubmit,
            })

            const handleSubmit = form.handleSubmit()
            await handleSubmit()

            expect(onSubmit).not.toHaveBeenCalled()
        })

        it('should call onValid callback if provided', async () => {
            const onValid = vi.fn()
            const form = useForm({
                initialValues: { name: 'John' },
            })

            const handleSubmit = form.handleSubmit(onValid)
            await handleSubmit()

            expect(onValid).toHaveBeenCalled()
        })

        it('should call onInvalid callback when validation fails', async () => {
            const onInvalid = vi.fn()
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Name required' }],
                },
                initialValues: { name: '' },
            })

            const handleSubmit = form.handleSubmit(undefined, onInvalid)
            await handleSubmit()

            expect(onInvalid).toHaveBeenCalledWith({
                name: ['Name required'],
            })
        })

        it('should set isSubmitting during submission', async () => {
            const onSubmit = vi.fn(
                () => new Promise<void>((resolve) => setTimeout(resolve, 100))
            )
            const form = useForm({
                initialValues: { name: 'John' },
                onSubmit,
            })

            const handleSubmit = form.handleSubmit()
            const submitPromise = handleSubmit()

            expect(form.meta.value.isSubmitting).toBe(true)

            await submitPromise

            expect(form.meta.value.isSubmitting).toBe(false)
        })

        it('should increment submit count', async () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            expect(form.meta.value.submitCount).toBe(0)

            const handleSubmit = form.handleSubmit()
            await handleSubmit()
            expect(form.meta.value.submitCount).toBe(1)

            await handleSubmit()
            expect(form.meta.value.submitCount).toBe(2)
        })

        it('should prevent default event behavior', async () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            const event = {
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            } as any

            const handleSubmit = form.handleSubmit()
            await handleSubmit(event)

            expect(event.preventDefault).toHaveBeenCalled()
            expect(event.stopPropagation).toHaveBeenCalled()
        })

        it('should handle submission errors gracefully', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
            const onSubmit = vi.fn().mockRejectedValue(new Error('Submission error'))

            const form = useForm({
                initialValues: { name: 'John' },
                onSubmit,
            })

            const handleSubmit = form.handleSubmit()
            await handleSubmit()

            expect(consoleError).toHaveBeenCalledWith(
                'Form submission error:',
                expect.any(Error)
            )
            expect(form.meta.value.isSubmitting).toBe(false)

            consoleError.mockRestore()
        })
    })

    describe('Reset Functionality', () => {
        it('should reset form to initial values', () => {
            const initialValues = { name: 'John', email: 'john@example.com' }
            const form = useForm({ initialValues })

            form.setFieldValue('name', 'Jane')
            form.setFieldError('name', 'Error')
            form.resetForm()

            expect(form.values.value).toEqual(initialValues)
            expect(form.errors.value).toEqual({})
            expect(form.fieldsMeta.value).toEqual({})
        })

        it('should reset to new values if provided', () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            form.resetForm({ values: { name: 'Jane' } })

            expect(form.values.value.name).toBe('Jane')
        })

        it('should reset meta state', () => {
            const form = useForm({
                initialValues: { name: 'John' },
            })

            // Trigger a submit to increment counter
            form.handleSubmit()()

            form.resetForm()

            expect(form.meta.value.submitCount).toBe(0)
            expect(form.meta.value.isSubmitting).toBe(false)
            expect(form.meta.value.isValidating).toBe(false)
        })
    })

    describe('Register Method', () => {
        it('should register field and return bindings', () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const field = form.register('name')

            expect(field).toHaveProperty('value')
            expect(field).toHaveProperty('name')
            expect(field).toHaveProperty('onInput')
            expect(field).toHaveProperty('onBlur')
            expect(field.name).toBe('name')
        })

        it('should update value on input event', () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const field = form.register('name')
            const event = {
                target: { value: 'John' },
            } as any

            field.onInput(event)

            expect(form.values.value.name).toBe('John')
        })

        it('should mark field as touched on blur', () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const field = form.register('name')
            field.onBlur()

            expect(form.fieldsMeta.value.name?.touched).toBe(true)
        })

        it('should validate on blur when validateOn is blur', async () => {
            const form = useForm({
                initialValues: { name: '' },
            })

            const field = form.register('name', {
                rules: [{ type: 'required', message: 'Required' }],
                validateOn: 'blur',
            })

            field.onBlur()

            // Wait for async validation
            await new Promise((resolve) => setTimeout(resolve, 0))

            expect(form.getFieldError('name')).toBe('Required')
        })

        it('should initialize field value if not exists', () => {
            const form = useForm({
                initialValues: {},
            })

            form.register('newField')

            expect((form.values.value as any).newField).toBe('')
        })
    })

    describe('Edge Cases', () => {
        it('should handle array values in required validation', async () => {
            const rules: ValidationRule[] = [
                { type: 'required', message: 'Array required' },
            ]

            const form = useForm({
                schema: { items: rules },
                initialValues: { items: [] },
            })

            const result = await form.validateField('items', rules)

            expect(result.valid).toBe(false)
            expect(form.getFieldError('items')).toBe('Array required')
        })

        it('should handle null and undefined in required validation', async () => {
            const rules: ValidationRule[] = [
                { type: 'required', message: 'Required' },
            ]

            const formNull = useForm({
                schema: { field: rules },
                initialValues: { field: null },
            })

            const resultNull = await formNull.validateField('field', rules)
            expect(resultNull.valid).toBe(false)

            const formUndefined = useForm({
                schema: { field: rules },
                initialValues: { field: undefined },
            })

            const resultUndefined = await formUndefined.validateField('field', rules)
            expect(resultUndefined.valid).toBe(false)
        })

        it('should clear errors when validation passes', async () => {
            const form = useForm({
                schema: {
                    name: [{ type: 'required', message: 'Required' }],
                },
                initialValues: { name: '' },
            })

            await form.validateField('name')
            expect(form.getFieldError('name')).toBe('Required')

            form.setFieldValue('name', 'John')
            await form.validateField('name')

            expect(form.getFieldError('name')).toBeUndefined()
        })
    })
})
