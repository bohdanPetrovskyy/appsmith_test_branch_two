export default {
	formCounter: 0,
	isFamily: null,

	onPageLoad(){
		this.formCounter = get_family.data?.data?.children.length || 1;
		this.isFamily = get_family.data?.data?.family.length > 0;
	},

	async handleSubmit(){
		if (this.isFamily) {
			const data = {
				Children: ChildrenCheckbox.isChecked,
				FamilyStatus: FamilyStatus.selectedOptionValue
			}
			await update_identification.run({
				personId: maininfo.employeeID,
				data
			})
		} else {
			const dataIdentification = {
				PersonFestCloudID: maininfo.employeeID,
				Children: ChildrenCheckbox.isChecked,
				FamilyStatus: FamilyStatus.selectedOptionValue
			};

			await insert_identification_all.run({
				dataIdentification
			})
		}

		if (!ChildrenCheckbox.isChecked && this.formCounter > 0){
			// We only need to delete all children
			await delete_child_all.run()
			this.restoreData();
			switcher.showAlert();
			return;
		}


		const forms = [FormChild0.data, FormChild1.data, FormChild2.data, FormChild3.data, FormChild4.data, FormChild5.data].filter(f => f !== undefined);
		const correctForms = forms.map(form => {

			const Name = Object.keys(form).filter(k => k.startsWith('ChildName'))[0];
			const Birthday = Object.keys(form).filter(k => k.startsWith('ChildBirthday'))[0];

			return {
				Name: form[Name],
				Birthday: form[Birthday]
			}
		}).filter(f => f.Name);

		for (let i = 0; i < correctForms.length; i++) {
			if (get_family.data?.data?.children[i]) {
				//update
				const data = {
					Name: utils.capitalizeFirstLowerRest(correctForms[i].Name),
					Birthday: utils.formatDate(correctForms[i].Birthday)
				};

				const festCloudId = get_family.data?.data?.children[i].FestCloudID;

				await update_child.run({
					festCloudId,
					data
				})

			} else if (!get_family.data?.data?.children[i] && correctForms[i].Name) {
				//insert
				const data = {
					PersonFestCloudID: maininfo.employeeID,
					Name: utils.capitalizeFirstLowerRest(correctForms[i].Name),
					Birthday: utils.formatDate(correctForms[i].Birthday)
				};

				await insert_child.run({
					data
				});
			}
		}

		this.restoreData();
		switcher.showAlert();
	},

	async addForm(){
		if (this.formCounter === 6) {
			return;
		}

		this.formCounter++;
	},

	async removeForm(num) {
		this.formCounter--;
		await resetWidget(`FormChild${num}`);

		if (get_family.data?.data?.children[num]) {
			const festCloudId = get_family.data?.data?.children[num].FestCloudID

			await delete_child.run({
				festCloudId
			});
			this.restoreData();
		}
	},

	async restoreData(){
		await get_family.run();
		this.onPageLoad();
	}
}