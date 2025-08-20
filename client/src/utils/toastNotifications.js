import toast from "react-hot-toast";

export const dismissToast = (toastId) => {
    toast.dismiss(toastId)
}

export const showLoading = (message = "Please wait a moment!") => {
    return toast.loading(message)
}

export const showSuccess = (message) => {
    toast.success(message)
}

export const showError = (err, fallback = "Something went wrong. Please try again later.") => {
    const messageErr = typeof err === 'string' ? err : err?.response?.data?.message || fallback
    toast.error(messageErr)
}