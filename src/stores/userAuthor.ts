import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('AuthorStore', () => {
    //   const Auth = ref(false)
    const Auth = ref(localStorage.getItem('auth') === 'true')

    // 设置 Auth 的值
    function setAuth(value: boolean) {
        Auth.value = value
    }

    // 切换 Auth 的值 (true <-> false)
    function toggleAuth() {
        Auth.value = !Auth.value
    }

    watch(
        () => Auth.value,
        (newVal) => {
            localStorage.setItem('auth', String(newVal))
        }
    )

    return { Auth, setAuth, toggleAuth }
})