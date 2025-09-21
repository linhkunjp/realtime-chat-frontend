export const formatDate = (dateString: string, onlyDate?: boolean) => {
    if (dateString == '') return ''
    const date = new Date(dateString)
    const now = new Date()

    const isSameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    if (isSameDay) {
        // Hiện giờ phút
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    } else {
        if (onlyDate) {
            // Hiện (MM/DD/YY)
            return date.toLocaleDateString('vi-VN', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
            })
        } else {
            // Hiện ngày + giờ
            return date.toLocaleString([], {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
        }
    }
}