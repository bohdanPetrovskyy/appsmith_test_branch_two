export default {
	endDate: moment(),
	responsiblePeople: [],

	async onPageLoad(){
		await this.fetchData();
	},

	async fetchData() {
		await TokenValidator.validateToken();
		await i18n.setup(appsmith.store.localization || "uk")
		await this.getResponsibleData();
	},

	async getResponsibleData() {
		const { data } =  await get_all_managers.run();

		// We have to select only uniq fiels and sort them
		this.responsiblePeople = _.uniqBy(data.peopleAssignment
																			.map(person => ({
			label: `${person.assignmentEmployee.employeeInfo.FamilyName} ${person.assignmentEmployee.employeeInfo.Name}`,
			value: person.EmployeeFestCloudID
		})), 'value') // Value must be uniq
			.sort((personOne, personTwo) => personOne.label.localeCompare(personTwo.label))
	},

	getReasons(){
		// First of all we have to find reasons and skip 2 elements from begin, because that not actual reasons
		// After that we have to transform them in correct format
		return	Object.keys(Constants.defaultLanguageKeys).filter(key => key.startsWith('dismissalReason')).slice(2)
			.map((reason, i) => ({
			"reason": i18n.translate(reason),
			'id': i + 1, // Have to add +1 cause index 0 is incorrect
		}))
			.sort((reasonOne, reasonTwo) => reasonOne.reason.localeCompare(reasonTwo.reason.localCompare));
	},

	async handleNavigateOrgChart(){
		// Trying to update 
		try{
			await insert_people_assignment.run();
			showAlert(i18n.translate('employeeFiredAlert'), 'success')
		}catch(error){
			showAlert(i18n.translate("errorWhileAssignmentAlert") + error.message, 'error');
		}

		navigateTo(appsmith.URL.queryParams.returnTo || "Profile_Page", {...appsmith.URL.queryParams, storage: 'internal'})
	},

	handleDateSelected(){
		this.endDate = moment(endDatePicker.formattedDate, 'DD/MM/YYYY').format('YYYY-MM-DDT00:00:00')
	},
}