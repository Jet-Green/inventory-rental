export default defineNuxtPlugin(async () => {
  await useAuth().checkAuth();
});
