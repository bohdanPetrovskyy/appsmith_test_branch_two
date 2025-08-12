export default {
	listKey: null,
	pageName: '',

	async changeList(item){	
		await TokenValidator.validateToken();

		const id = item?.id ?? "main_info";
		const name = item?.name ?? "Основна інформація";

		if (id === this.listKey) {
			return;
		}

		this.pageName = name;
		this.listKey = id;

		switch(this.listKey){
			case "main_info":
				await get_maininfo.run();
				maininfo.onPageLoad();
				break;
			case "identity_data":
				await get_identification.run();
				identification.onPageLoad();
				break;
			case "experience":
				await get_workexperience.run();
				workexperience.onPageLoad();
				break;
			case "education":
				await get_education.run();
				education.onPageLoad();
				break;
			case "courses":
				await get_additionaleducation.run();
				courses.onPageLoad();
				break;
			case "languages":
				await get_language.run();
				language.onPageLoad();
				break;
			case "additional_info":
				await get_additionalinfo.run();
				additionalinfo.onPageLoad();
				break;
			case "family":
				await get_family.run();
				family.onPageLoad();
		}
	},

	showAlert(){
		showAlert(`Сторінка ${this.pageName} уcпішно оновлена`, 'success')
	},
}
