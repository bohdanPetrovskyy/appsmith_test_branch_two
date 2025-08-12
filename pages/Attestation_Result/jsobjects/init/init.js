export default {
	assigmentId: appsmith.URL.queryParams.selectedAssigmentId,
	async init () {
		await TokenValidator.validateToken();
		await get_all_assigments.run();
		await get_all_questions.run();
		await GetQuestionsFilter.run();
		await utils.createAttestationList();
		await utils.resultCounter();
	}
}