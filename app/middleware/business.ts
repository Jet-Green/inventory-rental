/** Доступ к разделу кабинета бизнеса. Роль в API по-прежнему `lessor`. */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  if (!auth.user?._id) {
    const ok = await auth.checkAuth();
    if (!ok) {
      return navigateTo({ path: "/auth", query: { businessNeedAuth: "1" } });
    }
  }
  const rolesBefore = auth.user?.roles || [];
  if (rolesBefore.includes("admin")) {
    return;
  }

  const { fetchProfile, profile } = useAuthProfile();
  await fetchProfile();

  const roles = auth.user?.roles || [];
  if (!roles.includes("lessor")) {
    /* До одобрения заявки на бэкенде у пользователя часто только `renter`, без `lessor`.
       Раньше все ссылки кабинета вели на /cabinet/select — отправляем на верификацию. */
    if (roles.includes("renter")) {
      return navigateTo({
        path: "/business-cabinet/verification",
        query: { needBusinessVerification: "1" },
      });
    }
    return navigateTo({
      path: "/cabinet/select",
      query: { businessAccessDenied: "1" },
    });
  }

  if (profile.value?.isLessorVerified) {
    return;
  }

  return navigateTo({
    path: "/business-cabinet/verification",
    query: { needBusinessVerification: "1" },
  });
});
