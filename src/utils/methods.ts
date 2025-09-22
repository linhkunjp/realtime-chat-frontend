export const formatDate = (dateString: string, onlyDate?: boolean) => {
    if (dateString == '') return ''
    const date = new Date(dateString)
    const now = new Date()

    const isSameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    // Kiểm tra hôm qua
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()

    // Kiểm tra trong tuần này
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    const isThisWeek = date >= startOfWeek && date <= now

    if (isSameDay) {
        // Hiện giờ phút
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    } else {
        if (onlyDate) {
            if (isYesterday) {
                return 'Hôm qua'
            } else if (isThisWeek) {
                const weekdays = [
                    "Chủ nhật",
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                ]
                return weekdays[date.getDay()]
            }
            else {
                // Hiện (MM/DD/YY)
                return date.toLocaleDateString('vi-VN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                })
            }
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