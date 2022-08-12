import { ElMessage } from "element-plus";

export function useNotification() {
  function notify({ type, message }) {
    ElMessage({
      type,
      message
    });
  }

  return { notify };
}
