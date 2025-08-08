<template>
  <div>
    <span class="text-black text-2xl mx-6 my-8">Verifying....</span>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue'
import { useUser, useSignIn, useSignUp, useClerk, useAuth } from '@clerk/vue'

interface UserData {
  userId: string
  email: string
  username: string
  image: string
}

const { user } = useUser()
const toast = useToast()
const { setActive } = useSignIn()
const { signUp } = useSignUp()
const clerk = useClerk()
const { getToken } = useAuth()
const authStore = useAuthStore()

const handleSuccess = (userData: UserData, token: string) => {
  localStorage.setItem('user_id', userData.userId ?? '')
  localStorage.setItem('email', userData.email ?? '')
  localStorage.setItem('username', userData.username ?? '')
  localStorage.setItem('image', userData.image ?? '')
  localStorage.setItem('token', token ?? '')

  handleRedirect()
}

const handleRedirect = () => {
  toast.add({
    severity: 'success',
    summary: 'Xác thực thành công',
    group: 'tl',
    life: 3000,
  })

  setTimeout(() => (window.location.href = '/'), 200)
}

watchEffect(async () => {
  authStore.isLoading = true
  if (clerk.value?.client?.signIn) {
    const signIn = clerk.value?.client?.signIn
    const token = await getToken.value()
    console.log('signIn: ', signIn)
    console.log('token: ', token)

    // Nếu đã có tài khoản
    if (token) {
      handleSuccess(
        {
          userId: user.value?.id ?? '',
          email: user.value?.emailAddresses[0]?.emailAddress ?? '',
          username: user.value?.username ?? '',
          image: user.value?.imageUrl ?? '',
        },
        token,
      )
      return
    }

    // Kiểm tra status trả về từ callback
    const userNeedsToBeCreated = signIn.firstFactorVerification
    if (userNeedsToBeCreated && userNeedsToBeCreated.status == 'transferable') {
      const res = await signUp.value?.create({
        transfer: true,
      })

      console.log(res)
      if (res?.status === 'complete') {
        await setActive.value?.({
          session: res.createdSessionId,
        })
        const newToken = await getToken.value()
        const userData = {
          userId: user.value?.id ?? '',
          email: user.value?.emailAddresses[0]?.emailAddress ?? '',
          username: user.value?.fullName ?? '',
          image: user.value?.imageUrl ?? '',
        }

        const response = await authStore.handleAuth(userData, newToken ?? '')
        if (response && response.isSuccess == false) {
          toast.add({
            severity: 'error',
            summary: response.message,
            group: 'tl',
            life: 3000,
          })
        } else {
          handleRedirect()
        }
      }
    }
  }
})
</script>
