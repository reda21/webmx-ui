import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Datepicker from '../../src/components/ui/datepicker/DatePicker.vue'

describe('Datepicker', () => {
    it('renders correctly with default props', () => {
        const wrapper = mount(Datepicker)
        const input = wrapper.find('input')

        expect(input.exists()).toBe(true)
        expect(input.element.value).toBe('Sélectionner une date')
    })

    it('displays formatted date from modelValue', () => {
        const wrapper = mount(Datepicker, {
            props: {
                modelValue: '2023-12-25'
            }
        })
        const input = wrapper.find('input')
        // Checks strict equality with the value property
        expect(input.element.value).toBe('25/12/2023')
    })

    it('emits update:modelValue when date is selected', async () => {
        const wrapper = mount(Datepicker, {
            props: {
                modelValue: ''
            }
        })

        // We can simulate the update event from the internal VCalendar component
        // Since we can't easily click the calendar in JSDOM without more setup, 
        // we'll trigger the update directly on the component logic if possible 
        // or assume the v-model binding works.
        // Better: test the computed property logic if we inspect the vm, 
        // or trigger the event that VCalendar would emit.

        // Let's try to access the internal component or the computed property logic directly?
        // Actually, let's just inspect that the component prepares the props correctly for VCalendar.
        // It passes `dateValue` which is a computed.

        const vm = wrapper.vm as any

        // Test the internal setter logic
        vm.dateValue = new Date(2024, 0, 1) // Jan 1st 2024

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2024-01-01'])
    })

    it('clears value when null is passed', async () => {
        const wrapper = mount(Datepicker, {
            props: {
                modelValue: '2023-12-25'
            }
        })

        const vm = wrapper.vm as any
        vm.dateValue = null

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('respects disabled prop', () => {
        const wrapper = mount(Datepicker, {
            props: {
                disabled: true
            }
        })
        const input = wrapper.find('input')
        expect(input.attributes('disabled')).toBeDefined()
    })

    it('applies custom class', () => {
        const wrapper = mount(Datepicker, {
            props: {
                class: 'custom-class'
            }
        })
        const input = wrapper.find('input')
        expect(input.classes()).toContain('custom-class')
    })

    it('handles empty/undefined modelValue gracefully', () => {
        const wrapper = mount(Datepicker, {
            props: {
                modelValue: undefined
            }
        })
        const input = wrapper.find('input')
        expect(input.element.value).toBe('Sélectionner une date')
    })
})
