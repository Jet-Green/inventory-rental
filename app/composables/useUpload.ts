import { toast } from "vue3-toastify";
import UploadApi from "~/api/UploadApi";

const MAX_SIZE = 8 * 1024 * 1024; // 8 МБ
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function useUpload() {
  const isUploading = useState<boolean>("upload-photos-loading", () => false);

  /** Возвращает массив загруженных URL; валидирует тип/размер до отправки. */
  async function uploadPhotos(files: File[]): Promise<string[]> {
    const valid = files.filter((file) => {
      if (!ALLOWED.includes(file.type)) {
        toast(`Файл «${file.name}»: недопустимый тип.`, { type: "warning" });
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast(`Файл «${file.name}»: больше 8 МБ.`, { type: "warning" });
        return false;
      }
      return true;
    });
    if (!valid.length) return [];

    try {
      isUploading.value = true;
      const response = await UploadApi.photos(valid);
      return response.urls || [];
    } finally {
      isUploading.value = false;
    }
  }

  return { isUploading, uploadPhotos };
}
