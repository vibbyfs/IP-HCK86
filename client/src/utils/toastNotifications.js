import toast from "react-hot-toast";

export const dismissToast = (toastId) => {
    toast.dismiss(toastId)
}

export const showLoading = (message = "Please wait a moment!") => {
    return toast.loading(message)
}

export const showSuccess = (message, id) => {
    // Use a fixed id to avoid stacking if provided
    if (id) return toast.success(message, { id })
    return toast.success(message)
}

export const showError = (err, fallback = "Something went wrong. Please try again later.", id) => {
    const messageErr = typeof err === 'string' ? err : err?.response?.data?.message || fallback
    // If an id is provided, the toast will update instead of stacking
    if (id) return toast.error(messageErr, { id })
    return toast.error(messageErr)
}