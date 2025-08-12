export default {
	isWithin24Hours: (auditCreatedAt) => {
		const createdAt = new Date(auditCreatedAt);
		const now = new Date();

		const diffInMs = now.getTime() - createdAt.getTime();
		const hours24InMs = 24 * 60 * 60 * 1000;

		return diffInMs <= hours24InMs;
	}
}
