export default {
	timeoutId: null,
	prevCheck: null,

	async loadData() {
		await TokenValidator.validateToken();
		await get_all_assignments.run();
	},

	debouncedTriggerByTree(checked) {
		if(_.isEqual(this.prevCheck, checked)) {
			return
		}
		this.prevCheck = checked
		this.debouncedFetch()
	},

	debouncedFetch() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}

		this.timeoutId = setTimeout(() => {
			this.loadData();
		}, 1000);
	}
}
