import { defineStore } from 'pinia'

export const useDarkModeStore = defineStore('darkMode', {
    state: () => ({
        isDark: localStorage.getItem('theme') === 'dark',
    }),

    actions: {

        toggleDarkMode() {
            this.isDark = !this.isDark
            localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
            this.updateHtmlClass()
        },

        updateHtmlClass() {
            const html = document.documentElement
            if (this.isDark) {
                html.classList.add('dark')
            } else {
                html.classList.remove('dark')
            }
        },
    },
})
