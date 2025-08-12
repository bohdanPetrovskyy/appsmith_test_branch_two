export default {
	runQuerries: async () => {
		await i18n.setup(appsmith.store.localization || "uk")
		await TokenValidator.validateToken();
		await get_all_people_person.run();
	},
}
