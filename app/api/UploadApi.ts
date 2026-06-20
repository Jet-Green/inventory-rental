import type { IUploadResult } from "~/types/rental";

export default {
  /** Загрузка до 5 изображений (≤8МБ) — multipart, поле `files`. */
  async photos(files: File[]): Promise<IUploadResult> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    return useNuxtApp().$apiFetch("/upload/photos", {
      method: "POST",
      body: formData,
    });
  },
};
