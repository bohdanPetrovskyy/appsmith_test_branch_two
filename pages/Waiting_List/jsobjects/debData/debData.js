export default {
	timeoutId: null,
	prevCheck: null,

	async loadData() {
		await TokenValidator.validateToken();
		await get_all_people_person.run();
	},

	debouncedFetch() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}

		this.timeoutId = setTimeout(() => {
			this.loadData();
		}, 500);
	}
}
