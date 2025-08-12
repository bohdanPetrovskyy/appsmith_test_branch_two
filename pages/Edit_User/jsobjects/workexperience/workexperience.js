export default{
	formCounter: 0,

	onPageLoad(){
		this.formCounter = get_workexperience.data?.data?.workexperience.length || 1;
	},

	async handleSubmit(){
		const forms = [Form1.data, Form2.data, Form3.data, Form4.data, Form5.data, Form6.data, Form7.data].filter(f => f !== undefined);

		const correctForms = forms.map(form => {

			const CompanyName = Object.keys(form).filter(k => k.startsWith('CompanyName'))[0];
			const PositionName = Object.keys(form).filter(k => k.startsWith('PositionName'))[0];
			const StartDate = Object.keys(form).filter(k => k.startsWith('WorkStartDate'))[0];
			const EndDate = Object.keys(form).filter(k => k.startsWith('WorkEndDate'))[0];

			return {
				CompanyName: form[CompanyName],
				PositionName: form[PositionName],
				StartDate: form[StartDate],
				EndDate: form[EndDate]
			}
		}).filter(f => f.CompanyName);


		for (let i = 0; i < correctForms.length; i++) {
			if (get_workexperience.data?.data?.workexperience[i]) {
				//update
				const data = {
					CompanyName: utils.capitalizeFirstLowerRest(correctForms[i].CompanyName),
					PositionName: utils.capitalizeFirstLowerRest(correctForms[i].PositionName),
					EndDate: utils.formatDate(correctForms[i].EndDate),
					StartDate: utils.formatDate(correctForms[i].StartDate)
				};

				const festCloudId = get_workexperience.data?.data?.workexperience[i].FestCloudID

				await update_workexpierence.run({
					festCloudId,
					data,
				})


			} else if (!get_workexperience.data?.data?.workexperience[i] && correctForms[i].CompanyName) {
				const data = {
					PersonFestCloudID: maininfo.employeeID,
					CompanyName: utils.capitalizeFirstLowerRest(correctForms[i].CompanyName),
					PositionName: utils.capitalizeFirstLowerRest(correctForms[i].PositionName),
					EndDate: utils.formatDate(correctForms[i].EndDate),
					StartDate: utils.formatDate(correctForms[i].StartDate)
				};

				await insert_workexpierence.run({
					data
				});
			}
		}

		this.restoreData();

		switcher.showAlert();
	},

	async removeForm(num){
		this.formCounter--;
		await resetWidget(`Form${num + 1}`)
		if (get_workexperience.data.data.workexperience[num]) {
			const festCloudId = get_workexperience.data?.data?.workexperience[num].FestCloudID;

			await delete_workexperience.run({
				festCloudId
			})

			this.restoreData();
		}

	},

	async addForm(){
		if (this.formCounter === 7) {
			return;
		}

		this.formCounter++;
	},

	async restoreData(){
		await get_workexperience.run();
		this.onPageLoad();
	},
}