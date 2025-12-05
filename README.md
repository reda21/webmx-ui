# Web-UI

A modern, accessible Vue 3 component library built with TypeScript, Tailwind CSS, and Radix Vue. Designed for building beautiful, responsive web applications.

[![npm version](https://badge.fury.io/js/@reda21/web-ui.svg)](https://badge.fury.io/js/@reda21/web-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Beautiful Design** - Modern, clean aesthetics with customizable themes
- ♿ **Accessible** - Built on Radix Vue primitives for excellent accessibility
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🔧 **Customizable** - Easy theming with CSS variables and Tailwind CSS
- 📦 **Tree-shakeable** - Import only what you need
- 🔍 **TypeScript** - Full TypeScript support with type definitions
- ✅ **Form Validation** - Built-in support for Zod, Yup, or custom validation

## 📦 Installation

```bash
# npm
npm install @reda21/web-ui

# pnpm
pnpm add @reda21/web-ui

# yarn
yarn add @reda21/web-ui
```

### Peer Dependencies

Make sure you have Vue 3 installed:

```bash
npm install vue@^3.5
```

## 🚀 Quick Start

### Import Styles

Import the CSS file in your main entry file:

```ts
// main.ts or main.js
import '@reda21/web-ui/dist/web-ui.css'
```

### Use Components

```vue
<script setup>
import { Button, Card, CardHeader, CardTitle, CardContent } from '@reda21/web-ui'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Welcome</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>Click me</Button>
    </CardContent>
  </Card>
</template>
```

---

## 📚 Components

### Button

A versatile button component with multiple variants, severities, and sizes.

```vue
<script setup>
import { Button } from '@reda21/web-ui'
</script>

<template>
  <!-- Variants -->
  <Button variant="soft">Soft</Button>
  <Button variant="outlined">Outlined</Button>
  <Button variant="subtle">Subtle</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>

  <!-- Severities -->
  <Button severity="secondary">Secondary</Button>
  <Button severity="success">Success</Button>
  <Button severity="info">Info</Button>
  <Button severity="warn">Warning</Button>
  <Button severity="danger">Danger</Button>
  <Button severity="help">Help</Button>
  <Button severity="contrast">Contrast</Button>

  <!-- Sizes -->
  <Button size="xs">Extra Small</Button>
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
  <Button size="xl">Extra Large</Button>
  <Button size="2xl">2XL</Button>
  <Button size="icon">🔥</Button>

  <!-- Other Props -->
  <Button rounded="full">Rounded</Button>
  <Button raised>Raised</Button>
  <Button square>Square</Button>
  <Button disabled>Disabled</Button>
</template>
```

#### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'soft' \| 'outlined' \| 'subtle' \| 'ghost' \| 'link'` | `'soft'` | Visual style variant |
| `severity` | `'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | `'secondary'` | Color severity |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'icon'` | `'md'` | Button size |
| `rounded` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | Border radius |
| `iconPos` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Icon position |
| `square` | `boolean` | `false` | Makes the button square |
| `raised` | `boolean` | `false` | Adds shadow |
| `disabled` | `boolean` | `false` | Disables the button |

---

### Card

A container component for grouping related content.

```vue
<script setup>
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@reda21/web-ui'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description goes here</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Your content here</p>
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>

  <!-- With severity -->
  <Card severity="success">
    <CardContent>Success card</CardContent>
  </Card>
</template>
```

#### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `severity` | `'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | - | Color severity |

---

### Input

A flexible input component with auto-binding, validation support, and multiple sizes.

```vue
<script setup>
import { Input } from '@reda21/web-ui'
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <!-- Basic usage -->
  <Input v-model="name" placeholder="Enter your name" />

  <!-- With label -->
  <Input v-model="name" label="Name" required />

  <!-- Sizes -->
  <Input size="xs" placeholder="Extra Small" />
  <Input size="sm" placeholder="Small" />
  <Input size="md" placeholder="Medium" />
  <Input size="lg" placeholder="Large" />
  <Input size="xl" placeholder="Extra Large" />
  <Input size="2xl" placeholder="2XL" />

  <!-- With help text -->
  <Input v-model="name" help="Enter your full name" />

  <!-- With error -->
  <Input v-model="name" error="This field is required" />

  <!-- Loading state -->
  <Input v-model="name" loading />

  <!-- Lazy update (on blur) -->
  <Input v-model="name" lazy />

  <!-- Debounced update -->
  <Input v-model="name" :debounce="300" />
</template>
```

#### Input Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | - | Input value (v-model) |
| `type` | `string` | `'text'` | Input type |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Input size |
| `label` | `string` | - | Label text |
| `placeholder` | `string` | - | Placeholder text |
| `help` | `string` | - | Help text below input |
| `error` | `string \| boolean` | - | Error message or state |
| `disabled` | `boolean` | `false` | Disables the input |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `lazy` | `boolean` | `false` | Updates on blur only |
| `debounce` | `number` | - | Debounce delay in ms |
| `highlight` | `boolean` | `false` | Animate on error |

---

### Textarea

A multiline text input component.

```vue
<script setup>
import { Textarea } from '@reda21/web-ui'
import { ref } from 'vue'

const message = ref('')
</script>

<template>
  <Textarea v-model="message" placeholder="Enter your message" />
  <Textarea v-model="message" :rows="5" />
</template>
```

---

### Form & Validation

A powerful form system with built-in validation support for Zod, Yup, or custom rules.

#### Basic Form with Custom Validation

```vue
<script setup>
import { Form, FormField, FormInput, Input, Button } from '@reda21/web-ui'

const schema = {
  name: [
    { type: 'required', message: 'Name is required' },
    { type: 'minLength', value: 2, message: 'Minimum 2 characters' }
  ],
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email address' }
  ]
}

const initialValues = { name: '', email: '' }

const onSubmit = (values) => {
  console.log('Form submitted:', values)
}
</script>

<template>
  <Form 
    :validation-schema="schema" 
    :initial-values="initialValues" 
    @submit="onSubmit"
    v-slot="{ values, errors, isSubmitting }"
  >
    <FormField name="name" label="Name">
      <Input />
    </FormField>

    <!-- Or use FormInput for a simpler API -->
    <FormInput name="email" label="Email" type="email" />

    <Button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </Button>

    <pre>{{ values }}</pre>
    <pre>{{ errors }}</pre>
  </Form>
</template>
```

#### Form with Yup Validation

```vue
<script setup>
import { Form, FormInput, Button } from '@reda21/web-ui'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Minimum 2 characters'),
  email: yup.string().required('Email is required').email('Invalid email')
})

const onSubmit = (values) => {
  console.log('Form submitted:', values)
}
</script>

<template>
  <Form :validation-schema="schema" @submit="onSubmit">
    <FormInput name="name" label="Name" />
    <FormInput name="email" label="Email" type="email" />
    <Button type="submit">Submit</Button>
  </Form>
</template>
```

#### Form with Zod Validation

```vue
<script setup>
import { Form, FormInput, Button } from '@reda21/web-ui'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Minimum 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email')
})

const onSubmit = (values) => {
  console.log('Form submitted:', values)
}
</script>

<template>
  <Form :validation-schema="schema" @submit="onSubmit">
    <FormInput name="name" label="Name" />
    <FormInput name="email" label="Email" type="email" />
    <Button type="submit">Submit</Button>
  </Form>
</template>
```

#### useForm Composable

For more control, use the `useForm` composable directly:

```vue
<script setup>
import { useForm, Input, Button } from '@reda21/web-ui'

const { values, errors, handleSubmit, register, resetForm } = useForm({
  initialValues: { name: '', email: '' },
  schema: {
    name: [{ type: 'required', message: 'Required' }],
    email: [{ type: 'email', message: 'Invalid email' }]
  }
})

const onSubmit = handleSubmit((data) => {
  console.log('Valid submission:', data)
})
</script>

<template>
  <form @submit="onSubmit">
    <input v-bind="register('name')" />
    <span v-if="errors.name">{{ errors.name[0] }}</span>
    
    <input v-bind="register('email')" />
    <span v-if="errors.email">{{ errors.email[0] }}</span>
    
    <button type="submit">Submit</button>
    <button type="button" @click="resetForm()">Reset</button>
  </form>
</template>
```

#### Form Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `values` | `object` | Current form values |
| `errors` | `object` | Current validation errors |
| `isSubmitting` | `boolean` | Whether form is submitting |
| `isValidating` | `boolean` | Whether form is validating |
| `resetForm` | `function` | Reset form to initial values |
| `setFieldValue` | `function` | Set a field value |
| `setFieldError` | `function` | Set a field error |

---

### Avatar

A component for displaying user avatars with fallback support.

```vue
<script setup>
import { Avatar, AvatarImage, AvatarFallback } from '@reda21/web-ui'
</script>

<template>
  <Avatar>
    <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
</template>
```

---

### Badge

A small status indicator component.

```vue
<script setup>
import { Badge } from '@reda21/web-ui'
</script>

<template>
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="destructive">Destructive</Badge>
</template>
```

---

### Tooltip

A popup that displays information on hover.

```vue
<script setup>
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Button } from '@reda21/web-ui'
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
```

---

### Drawer

A slide-out panel component.

```vue
<script setup>
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Button 
} from '@reda21/web-ui'
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button>Open Drawer</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Drawer Title</DrawerTitle>
        <DrawerDescription>Drawer description</DrawerDescription>
      </DrawerHeader>
      <div class="p-4">
        Your content here
      </div>
      <DrawerFooter>
        <Button>Save</Button>
        <DrawerClose as-child>
          <Button variant="outlined">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
```

---

### DatePicker

A date selection component.

```vue
<script setup>
import { DatePicker } from '@reda21/web-ui'
import { ref } from 'vue'

const date = ref(null)
</script>

<template>
  <DatePicker v-model="date" />
</template>
```

---

## 🎨 Theming

Web-UI uses CSS variables for theming. Override these variables to customize the look:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark mode variables */
}
```

---

## 📄 License

MIT © [Your Name]

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## 🐛 Bug Reports

Found a bug? Please open an issue with a clear description and reproduction steps.
