export default {
	// assigmentId: "ec96c7bd-05ca-4950-bded-94c3fe5a0dfd",
	assigmentId: appsmith.URL.queryParams.selectedAssigmentId,
	async init () {
		await TokenValidator.validateToken();
		await get_all_assigments.run();
		await get_all_questions.run();
		await GetQuestionsFilter.run();
		await utils.createAttestationList();
	}
}