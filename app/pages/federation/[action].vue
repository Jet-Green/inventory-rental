<script setup lang="ts">
import { rentalReturnPath } from '~/utils/rentalHandoff'
import type { IUserProfile } from '~/types/rental'
const route = useRoute(), auth = useAuth()
const action = computed(() => route.path.endsWith('/authorize') ? 'authorize' : 'callback')
const post = (path: string, body: Record<string, string>) => useNuxtApp().$apiFetch<{url?: string; path?: string; user?: IUserProfile}>(path, {method: 'POST', retry: 0, body})
const safePath = rentalReturnPath
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })

const loading = ref(true), error = ref(''), linking = ref(false)
const email = ref(''), password = ref(''), state = ref('')
const valid = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
const nativeLogin = computed(() => ({ path: '/auth', query: { returnTo: '/' } }))
async function accept(data: any) {
  if (!data.user) throw new Error('Invalid response')
  auth.setUser(data.user)
  await navigateTo(safePath(data.path), { replace: true })
}
async function proceed() {
  if (action.value !== 'authorize') return
  loading.value = true; error.value = ''
  if (!valid(route.query.state)) { error.value = 'Ссылка для входа недействительна. Начните вход заново.'; loading.value = false; return }
  try {
    if (!auth.user?._id) await auth.checkAuth()
    if (!auth.user?._id) { await navigateTo({ path: '/auth', query: { returnTo: route.fullPath } }, { replace: true }); return }
    const data = await post('/auth/federation/issue', { state: String(route.query.state) })
    const target = new URL(data.url || '')
    if (target.origin !== 'https://gorodaivesi.ru' || target.pathname !== '/federation/callback') throw new Error('Invalid destination')
    window.location.replace(target.href)
  } catch { error.value = 'Не удалось продолжить вход. Попробуйте ещё раз.'; loading.value = false }
}
async function linkAccount() {
  if (loading.value) return
  loading.value = true; error.value = ''
  try {
    const data = await post('/auth/federation/link', { state: state.value, email: email.value.trim(), password: password.value })
    password.value = ''
    await accept(data)
  } catch { password.value = ''; error.value = 'Не удалось подтвердить аккаунт. Проверьте email и пароль или начните вход заново.' }
  finally { loading.value = false }
}
onMounted(async () => {
  if (action.value === 'authorize') { await proceed(); return }
  if (action.value !== 'callback') { loading.value = false; error.value = 'Ссылка для входа недействительна.'; return }
  const params = new URLSearchParams(window.location.hash.slice(1))
  const code = params.get('code'), incomingState = params.get('state')
  window.history.replaceState({}, '', '/federation/callback')
  if (!valid(code) || !valid(incomingState)) { loading.value = false; error.value = 'Ссылка для входа недействительна. Начните вход заново.'; return }
  state.value = String(incomingState)
  try {
    const data = await post('/auth/federation/complete', { code: String(code), state: state.value })
    await accept(data)
  } catch (e: any) {
    const detail = e?.data
    if (detail?.code === 'ACCOUNT_LINK_REQUIRED') linking.value = true
    else error.value = 'Не удалось завершить вход. Ссылка могла устареть. Начните вход заново.'
  } finally { loading.value = false }
})
</script>
<template>
  <section class="page-container py-8 federation-page">
    <h1 class="section-title">{{ linking ? 'Подтвердите аккаунт Аренды' : 'Вход в Аренду' }}</h1>
    <p v-if="loading" role="status" aria-live="polite">Продолжаем вход…</p>
    <p v-if="error" role="alert" class="text-error">{{ error }}</p>
    <form v-if="linking" class="federation-form" @submit.prevent="linkAccount">
      <p>Аккаунт с таким email уже существует. Введите его пароль, чтобы связать аккаунты.</p>
      <v-text-field v-model="email" label="Email" type="email" autocomplete="username" required />
      <v-text-field v-model="password" label="Пароль аккаунта Аренды" type="password" autocomplete="current-password" required />
      <v-btn type="submit" color="primary" class="gv-cta" :loading="loading" :disabled="loading">Подтвердить и войти</v-btn>
    </form>
    <v-btn v-if="error && action === 'authorize'" @click="proceed" :disabled="loading">Повторить</v-btn>
    <NuxtLink v-if="!loading" :to="nativeLogin">Вернуться ко входу</NuxtLink>
  </section>
</template>
<style scoped>
.federation-page { max-width: 560px; overflow-wrap: anywhere; }
.federation-form { margin: 20px 0; }
.federation-page > a { display: block; margin-top: 20px; }
</style>
