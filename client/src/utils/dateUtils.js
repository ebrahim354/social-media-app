export const timeSince = date => {
	const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

	let interval = seconds / 31536000

	if (interval >= 1) {
		return Math.floor(interval) + ' years ago'
	}
	interval = seconds / 2592000
	if (interval >= 1) {
		return Math.floor(interval) + ' months ago'
	}
	interval = seconds / 86400
	if (interval >= 1) {
		return Math.floor(interval) + ' days ago'
	}
	interval = seconds / 3600
	if (interval >= 1) {
		return Math.floor(interval) + ' hours ago'
	}
	interval = seconds / 60
	if (interval >= 1) {
		return Math.floor(interval) + ' minutes ago'
	}
	if (interval === 0) return 'just now'
	return Math.floor(seconds) + ' seconds'
}
