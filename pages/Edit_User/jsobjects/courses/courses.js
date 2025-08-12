export default {
	formCounter: 0,

	onPageLoad(){
		this.formCounter = get_additionaleducation.data?.data?.additionaleducation?.length || 1;
	},

	async handleSubmit(){

		const forms = [FormCourse0.data, FormCourse1.data, FormCourse2.data, FormCourse3.data, FormCourse4.data, FormCourse5.data, FormCourse6.data, FormCourse7.data, FormCourse8.data, FormCourse9.data, FormCourse10.data, FormCourse11.data ].filter(f => f !== undefined);

		const correctForms = forms.map(form => {
			const CourseName = Object.keys(form).filter(k => k.startsWith('CourseName'))[0];
			const ObtainingDate = Object.keys(form).filter(k => k.startsWith('CourseObtaining'))[0];

			return {
				CourseName: form[CourseName],
				ObtainingDate: form[ObtainingDate],
			}
		}).filter(f => f.CourseName);

		for (let i = 0; i < correctForms.length; i++) {
			if (get_additionaleducation.data?.data?.additionaleducation[i]) {
				// update
				const festCloudId = get_additionaleducation.data?.data?.additionaleducation[i].FestCloudID;

				const data = {
					CourseName: utils.capitalizeFirstLowerRest(correctForms[i].CourseName),
					ObtainingDate: utils.formatDate(correctForms[i].ObtainingDate)
				};

				await update_additionaleducation.run({
					festCloudId,
					data,
				})
			} else if (!get_additionaleducation.data?.data?.additionaleducation[i] && correctForms[i]){
				const data = {
					PersonFestCloudID: maininfo.employeeID,
					CourseName: utils.capitalizeFirstLowerRest(correctForms[i].CourseName),
					ObtainingDate: utils.formatDate(correctForms[i].ObtainingDate)
				};

				await insert_additionaleducation.run({
					data
				})

			}
		}
		this.restoreData();
		switcher.showAlert();
	},

	async removeForm(num){
		this.formCounter--;
		await resetWidget(`FormCourse${num}`)

		if (get_additionaleducation.data?.data?.additionaleducation[num]) {
			const festCloudId = get_additionaleducation.data?.data?.additionaleducation[num].FestCloudID;

			await delete_additionaleducation.run({
				festCloudId
			})
			this.restoreData();
		}
	},

	async addForm(){
		if (this.formCounter === 12) {
			return;
		}

		this.formCounter++;
	},

	async restoreData(){
		await get_additionaleducation.run();
		this.onPageLoad();
	},
}