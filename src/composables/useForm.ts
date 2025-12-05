import { ref, reactive, computed, type Ref, watch } from 'vue'
import type { ZodSchema } from 'zod'
import type { AnyObjectSchema } from 'yup'

export interface ValidationRule {
    type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
    value?: any
    message: string
}

export interface FieldMeta {
    touched: boolean
    dirty: boolean
    error?: string
    valid: boolean
    pending: boolean
}

export interface FormMeta {
    touched: boolean
    dirty: boolean
    valid: boolean
    pending: boolean
    isSubmitting: boolean
    isValidating: boolean
    submitCount: number
    initialValues?: Record<string, any>
}

export interface FormState<T = Record<string, any>> {
    errors: Record<string, string>
    touched: Record<string, boolean>
    values: T
    submitCount: number
}

export interface UseFormOptions<T = Record<string, any>> {
    initialValues?: T
    initialErrors?: Record<string, string>
    initialTouched?: Record<string, boolean>
    validationSchema?: ZodSchema | AnyObjectSchema | Record<string, ValidationRule[]>
    schema?: ZodSchema | AnyObjectSchema | Record<string, ValidationRule[]> // Alias for validationSchema
    validateOnMount?: boolean
    keepValues?: boolean
    onSubmit?: (values: T, ctx: SubmissionContext) => void | Promise<void>
}

export interface SubmissionContext {
    resetForm: (state?: Partial<FormState>) => void
    setErrors: (errors: Record<string, string>) => void
    setFieldError: (field: string, message: string) => void
    setFieldValue: (field: string, value: any) => void
    setValues: (fields: Record<string, any>) => void
    setFieldTouched: (field: string, isTouched: boolean) => void
    setTouched: (fields: Record<string, boolean>) => void
}

export interface UseFormReturn<T = Record<string, any>> {
    values: Ref<T>
    errors: Ref<Record<string, string[]>> // Internal error bag (array of strings)
    errorBag: Ref<Record<string, string[]>> // Alias for errors
    meta: Ref<FormMeta>
    fieldsMeta: Ref<Record<string, FieldMeta>>
    isSubmitting: Ref<boolean>
    isValidating: Ref<boolean>
    submitCount: Ref<number>

    setFieldValue: (name: string, value: any) => void
    setValues: (fields: Record<string, any>) => void
    setFieldError: (name: string, error: string) => void
    setErrors: (fields: Record<string, string>) => void
    setServerErrors: (errors: Record<string, string[]>) => void
    setFieldTouched: (name: string, isTouched: boolean) => void
    setTouched: (fields: Record<string, boolean>) => void

    getFieldError: (name: string) => string | undefined
    getFieldMeta: (name: string) => FieldMeta

    validateField: (name: string, rules?: ValidationRule[]) => Promise<{ valid: boolean; errors: string[] }>
    validate: () => Promise<{ valid: boolean; errors: Record<string, string> }>

    handleSubmit: (onValid?: (data: T, ctx: SubmissionContext) => void | Promise<void>, onInvalid?: (errors: Record<string, string[]>) => void) => (e?: Event) => Promise<void>
    submitForm: (e?: Event) => Promise<void>
    handleReset: () => void
    resetForm: (state?: Partial<FormState>) => void
    reset: (state?: Partial<FormState>) => void

    register: (name: string, options?: { rules?: ValidationRule[], validateOn?: 'blur' | 'change' | 'submit' }) => {
        value: any
        onInput: (e: Event) => void
        onBlur: () => void
        name: string
    }
}

function validateValue(value: any, rules: ValidationRule[]): string | undefined {
    for (const rule of rules) {
        switch (rule.type) {
            case 'required':
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    return rule.message
                }
                break

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return rule.message
                }
                break

            case 'min':
                if (typeof value === 'number' && value < rule.value) {
                    return rule.message
                }
                break

            case 'max':
                if (typeof value === 'number' && value > rule.value) {
                    return rule.message
                }
                break

            case 'minLength':
                if (typeof value === 'string' && value.length < rule.value) {
                    return rule.message
                }
                break

            case 'maxLength':
                if (typeof value === 'string' && value.length > rule.value) {
                    return rule.message
                }
                break

            case 'pattern':
                if (value && !rule.value.test(value)) {
                    return rule.message
                }
                break

            case 'custom':
                if (value && !rule.value(value)) {
                    return rule.message
                }
                break
        }
    }

    return undefined
}

export function useForm<T extends Record<string, any> = Record<string, any>>(
    options: UseFormOptions<T> = {}
): UseFormReturn<T> {
    const {
        initialValues = {} as T,
        initialErrors = {},
        initialTouched = {},
        validationSchema,
        schema,
        onSubmit,
        validateOnMount = false
    } = options

    const activeSchema = validationSchema || schema

    const values = ref<T>({ ...initialValues }) as Ref<T>
    const errors = ref<Record<string, string[]>>({})
    const fieldsMeta = ref<Record<string, FieldMeta>>({})

    // Initialize errors from initialErrors
    Object.entries(initialErrors).forEach(([key, val]) => {
        errors.value[key] = [val]
    })

    // Initialize touched from initialTouched
    Object.entries(initialTouched).forEach(([key, val]) => {
        if (!fieldsMeta.value[key]) {
            fieldsMeta.value[key] = { touched: val, dirty: false, valid: true, pending: false }
        } else {
            fieldsMeta.value[key].touched = val
        }
    })

    const isSubmitting = ref(false)
    const isValidating = ref(false)
    const submitCount = ref(0)

    const fieldRules = ref<Record<string, ValidationRule[]>>({})

    // Detect schema type
    const isZodSchema = activeSchema && typeof activeSchema === 'object' && '_def' in activeSchema
    const isYupSchema = activeSchema && typeof activeSchema === 'object' && '__isYupSchema__' in activeSchema

    // If schema is a rules object, store it
    if (activeSchema && typeof activeSchema === 'object' && !isZodSchema && !isYupSchema) {
        fieldRules.value = activeSchema as Record<string, ValidationRule[]>
    }

    const meta = computed<FormMeta>(() => {
        const touched = Object.values(fieldsMeta.value).some(f => f.touched)
        const dirty = Object.values(fieldsMeta.value).some(f => f.dirty)
        const pending = Object.values(fieldsMeta.value).some(f => f.pending)
        const valid = Object.keys(errors.value).length === 0

        return {
            touched,
            dirty,
            valid,
            pending,
            isSubmitting: isSubmitting.value,
            isValidating: isValidating.value,
            submitCount: submitCount.value,
            initialValues
        }
    })

    const setFieldValue = (name: string, value: any) => {
        (values.value as any)[name] = value

        if (!fieldsMeta.value[name]) {
            fieldsMeta.value[name] = { touched: false, dirty: false, valid: true, pending: false }
        }
        fieldsMeta.value[name].dirty = true
    }

    const setValues = (fields: Record<string, any>) => {
        Object.entries(fields).forEach(([key, value]) => {
            setFieldValue(key, value)
        })
    }

    const setFieldError = (name: string, error: string) => {
        errors.value[name] = [error]
    }

    const setErrors = (fields: Record<string, string>) => {
        Object.entries(fields).forEach(([key, error]) => {
            setFieldError(key, error)
        })
    }

    const setServerErrors = (serverErrors: Record<string, string[]>) => {
        errors.value = { ...errors.value, ...serverErrors }
    }

    const setFieldTouched = (name: string, isTouched: boolean) => {
        if (!fieldsMeta.value[name]) {
            fieldsMeta.value[name] = { touched: isTouched, dirty: false, valid: true, pending: false }
        } else {
            fieldsMeta.value[name].touched = isTouched
        }
    }

    const setTouched = (fields: Record<string, boolean>) => {
        Object.entries(fields).forEach(([key, isTouched]) => {
            setFieldTouched(key, isTouched)
        })
    }

    const getFieldError = (name: string): string | undefined => {
        return errors.value[name]?.[0]
    }

    const getFieldMeta = (name: string): FieldMeta => {
        if (!fieldsMeta.value[name]) {
            fieldsMeta.value[name] = { touched: false, dirty: false, valid: true, pending: false }
        }
        // Update error state in meta
        fieldsMeta.value[name].error = getFieldError(name)
        fieldsMeta.value[name].valid = !fieldsMeta.value[name].error

        return fieldsMeta.value[name]
    }

    const validateField = async (name: string, rules?: ValidationRule[]): Promise<{ valid: boolean; errors: string[] }> => {
        const value = (values.value as any)[name]
        const rulesToUse = rules || fieldRules.value[name]

        // Validation with Zod
        if (isZodSchema) {
            try {
                await (activeSchema as ZodSchema).parseAsync(values.value)
                delete errors.value[name]
                return { valid: true, errors: [] }
            } catch (err: any) {
                const issues = err.issues || err.errors
                if (issues) {
                    const fieldError = issues.find((e: any) => e.path[0] === name)
                    if (fieldError) {
                        errors.value[name] = [fieldError.message]
                        return { valid: false, errors: [fieldError.message] }
                    }
                }
                // If error is not for this field, clear this field's error
                delete errors.value[name]
                return { valid: true, errors: [] }
            }
        }

        // Validation with Yup
        if (isYupSchema) {
            try {
                await (activeSchema as AnyObjectSchema).validateAt(name, values.value)
                delete errors.value[name]
                return { valid: true, errors: [] }
            } catch (err: any) {
                if (err.message) {
                    errors.value[name] = [err.message]
                    return { valid: false, errors: [err.message] }
                }
            }
        }

        // Validation with rules
        if (rulesToUse) {
            const error = validateValue(value, rulesToUse)
            if (error) {
                errors.value[name] = [error]
                return { valid: false, errors: [error] }
            } else {
                delete errors.value[name]
                return { valid: true, errors: [] }
            }
        }

        return { valid: true, errors: [] }
    }

    const validate = async (): Promise<{ valid: boolean; errors: Record<string, string> }> => {
        isValidating.value = true
        errors.value = {}

        // Validation with Zod
        if (isZodSchema) {
            try {
                await (activeSchema as ZodSchema).parseAsync(values.value)
                isValidating.value = false
                return { valid: true, errors: {} }
            } catch (err: any) {
                const issues = err.issues || err.errors
                if (issues) {
                    issues.forEach((error: any) => {
                        const fieldName = error.path[0]
                        if (!errors.value[fieldName]) {
                            errors.value[fieldName] = []
                        }
                        errors.value[fieldName].push(error.message)
                    })
                }
                isValidating.value = false

                // Convert to Record<string, string> (first error)
                const simpleErrors: Record<string, string> = {}
                Object.keys(errors.value).forEach(key => {
                    simpleErrors[key] = errors.value[key][0]
                })
                return { valid: false, errors: simpleErrors }
            }
        }

        // Validation with Yup
        if (isYupSchema) {
            try {
                await (activeSchema as AnyObjectSchema).validate(values.value, { abortEarly: false })
                isValidating.value = false
                return { valid: true, errors: {} }
            } catch (err: any) {
                if (err.inner && Array.isArray(err.inner)) {
                    err.inner.forEach((error: any) => {
                        const fieldName = error.path
                        if (!errors.value[fieldName]) {
                            errors.value[fieldName] = []
                        }
                        errors.value[fieldName].push(error.message)
                    })
                }
                isValidating.value = false

                // Convert to Record<string, string> (first error)
                const simpleErrors: Record<string, string> = {}
                Object.keys(errors.value).forEach(key => {
                    simpleErrors[key] = errors.value[key][0]
                })
                return { valid: false, errors: simpleErrors }
            }
        }

        // Validation with rules
        let isValid = true
        for (const [fieldName, rules] of Object.entries(fieldRules.value)) {
            const result = await validateField(fieldName, rules)
            if (!result.valid) isValid = false
        }

        isValidating.value = false

        // Convert to Record<string, string> (first error)
        const simpleErrors: Record<string, string> = {}
        Object.keys(errors.value).forEach(key => {
            simpleErrors[key] = errors.value[key][0]
        })

        return { valid: isValid, errors: simpleErrors }
    }

    const resetForm = (state?: Partial<FormState>) => {
        // Reset values
        values.value = { ...(state?.values || initialValues) } as T

        // Reset errors
        errors.value = {}
        if (state?.errors) {
            Object.entries(state.errors).forEach(([key, val]) => {
                errors.value[key] = [val]
            })
        }

        // Reset touched
        fieldsMeta.value = {}
        if (state?.touched) {
            Object.entries(state.touched).forEach(([key, val]) => {
                fieldsMeta.value[key] = { touched: val, dirty: false, valid: true, pending: false }
            })
        }

        // Reset counters
        isSubmitting.value = false
        isValidating.value = false
        submitCount.value = state?.submitCount || 0
    }

    const handleReset = () => {
        resetForm()
    }

    const submissionContext: SubmissionContext = {
        resetForm,
        setErrors,
        setFieldError,
        setFieldValue,
        setValues,
        setFieldTouched,
        setTouched
    }

    const handleSubmit = (
        onValid?: (data: T, ctx: SubmissionContext) => void | Promise<void>,
        onInvalid?: (errors: Record<string, string[]>) => void
    ) => {
        return async (e?: Event) => {
            if (e) {
                e.preventDefault()
                e.stopPropagation()
            }

            isSubmitting.value = true
            submitCount.value++

            const result = await validate()

            if (result.valid) {
                try {
                    if (onValid) {
                        await onValid(values.value, submissionContext)
                    } else if (onSubmit) {
                        await onSubmit(values.value, submissionContext)
                    }
                } catch (error) {
                    console.error('Form submission error:', error)
                }
            } else {
                if (onInvalid) {
                    onInvalid(errors.value)
                }
            }

            isSubmitting.value = false
        }
    }

    const submitForm = async (e?: Event) => {
        const handler = handleSubmit()
        await handler(e)
    }

    const register = (
        name: string,
        options?: { rules?: ValidationRule[], validateOn?: 'blur' | 'change' | 'submit' }
    ) => {
        const { rules, validateOn = 'blur' } = options || {}

        if (rules) {
            fieldRules.value[name] = rules
        }

        if (!(values.value as any)[name]) {
            (values.value as any)[name] = ''
        }

        return {
            value: computed(() => (values.value as any)[name]),
            name,
            onInput: (e: Event) => {
                const target = e.target as HTMLInputElement
                setFieldValue(name, target.value)

                if (validateOn === 'change') {
                    validateField(name, rules)
                }
            },
            onBlur: () => {
                if (!fieldsMeta.value[name]) {
                    fieldsMeta.value[name] = { touched: false, dirty: false, valid: true, pending: false }
                }
                fieldsMeta.value[name].touched = true

                if (validateOn === 'blur') {
                    validateField(name, rules)
                }
            },
        }
    }

    // Validate on mount if requested
    if (validateOnMount) {
        validate()
    }

    return {
        values,
        errors, // Bag of errors (array)
        errorBag: errors, // Alias
        meta,
        fieldsMeta,
        isSubmitting,
        isValidating,
        submitCount,

        setFieldValue,
        setValues,
        setFieldError,
        setErrors,
        setServerErrors,
        setFieldTouched,
        setTouched,

        getFieldError,
        getFieldMeta,

        validateField,
        validate,

        handleSubmit,
        submitForm,
        handleReset,
        resetForm, // Alias for reset
        reset: resetForm, // Alias for backward compatibility

        register,
    }
}
