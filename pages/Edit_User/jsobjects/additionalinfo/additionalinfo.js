export default {
	beforeData: null,
	isNew: false,

	onPageLoad(){
		this.isNew = get_additionalinfo.data?.data?.additionalinfo[0] === undefined;
	},

	async handleSubmit(){
		if (this.isNew) {
			await this.handleCreate();
		} else {
			await this.handleUpdate();
		}
		
		switcher.showAlert();
	},

	async handleUpdate(){
		const data = {
			DrivingLicense: DrivingLicence.selectedOptionValue,
			CommunityBelonging: utils.capitalizeFirstLowerRest(CommunityBelonging.text),
			Interests: utils.capitalizeFirstLowerRest(Interests.text)
		};

		await update_additionalinfo.run({
			personId: maininfo.employeeID,
			data
		})
	},

	async handleCreate(){
		const data = {
			PersonFestCloudID: maininfo.employeeID,
			DrivingLicense: DrivingLicence.selectedOptionValue,
			CommunityBelonging: utils.capitalizeFirstLowerRest(CommunityBelonging.text),
			Interests: utils.capitalizeFirstLowerRest(Interests.text)
		};

		await insert_addionalinfo.run({
			data
		});

		this.isNew = false;
	},
}