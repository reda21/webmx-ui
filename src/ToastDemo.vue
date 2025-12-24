<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip'
import { Toaster } from './components/ui/toast'
import { useToast } from './composables/useToast'

const { toast } = useToast()

const customTitle = ref('Notification Title')
const customTitre = ref('Titre (French Alias)')
const customDescription = ref('This is a customizable toast notification.')

function showToast() {
    toast({
        title: customTitle.value,
        description: customDescription.value,
        severity: 'success'
    })
}

function showTitreToast() {
    toast({
        titre: customTitre.value, // Testing the 'titre' alias
        description: customDescription.value,
        severity: 'info'
    })
}

function showNoTitleToast() {
    toast({
        // No title provided
        description: customDescription.value,
        severity: 'warn'
    })
}

function showDestructiveToast() {
    toast({
        severity: 'danger',
        title: 'Error!',
        description: 'Something went wrong with the toast.',
    })
}
</script>

<template>
    <div class="p-8 space-y-8">
        <section>
            <h2 class="text-2xl font-bold mb-4">Tooltip Demo</h2>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="outlined">Hover for Tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>This is a working tooltip!</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-4">Toast Demo</h2>

            <div class="grid gap-4 max-w-md border p-4 rounded-lg mb-4">
                <h3 class="font-semibold">Customize Toast</h3>
                <div class="grid gap-2">
                    <label class="text-sm font-medium">Title (English field)</label>
                    <Input v-model="customTitle" placeholder="Enter title" />
                </div>
                <div class="grid gap-2">
                    <label class="text-sm font-medium">Titre (French alias)</label>
                    <Input v-model="customTitre" placeholder="Enter titre" />
                </div>
                <div class="grid gap-2">
                    <label class="text-sm font-medium">Description</label>
                    <Input v-model="customDescription" placeholder="Enter description" />
                </div>
            </div>

            <div class="flex flex-wrap gap-4">
                <Button @click="showToast">Show Toast (Title)</Button>
                <Button variant="secondary" @click="showTitreToast">Show Toast (Titre)</Button>
                <Button variant="outlined" @click="showNoTitleToast">Show Toast (No Title)</Button>
                <Button variant="destructive" @click="showDestructiveToast">Show Danger Toast</Button>
            </div>
        </section>

        <!-- Global Toaster -->
        <Toaster />
    </div>
</template>
