export default {
	beforeData: null,

	isPhoneValid: false,
	isMyPage: appsmith.URL.queryParams.isMyPage,
	storage: 'internal',
	isContact: false,
	isValid: true,

	// Delete condition, should work only with queryParams
	employeeID: appsmith.URL.queryParams.employeeFestCloudId,
	// || "3d1a5b32-ed5d-4f6c-b5b6-51150d0e6072",
	// "009f0abd-10df-4123-90a6-091e6e73fd9b",

	async onPageLoad(){
		await i18n.setup(appsmith.store.localization || "uk")
		this.isContact = get_maininfo.data?.data?.person[0]?.contact?.contact_info.length !== 0;

		this.beforeData = {
			familyName: get_maininfo.data?.data?.person[0]?.FamilyName,
			name: get_maininfo.data?.data?.person[0]?.Name,
			middleName: get_maininfo.data?.data?.person[0]?.MiddleName,
			phoneNumber: get_maininfo.data?.data?.person[0]?.contact?.contact_info[0]?.PhoneNumber,
			email: get_maininfo.data?.data?.person[0]?.contact?.contact_info[0]?.Email,
			gender: get_maininfo.data?.data?.person[0]?.Gender,
			birthday: get_maininfo.data?.data?.person[0]?.Birthday
		}

		if (this.beforeData.phoneNumber) {
			this.handlePhoneChange();
		}
	},

	async handleNavigateBack(){
		const returnTo = 'Profile_Page' || appsmith.URL.queryParams.returnTo;
		const id =  this.employeeID;

		await navigateTo(returnTo, {
			id, 
			isMyPage: this.isMyPage, 
			storage: this.storage,
			checked: appsmith.URL.queryParams.checked || '',
			expanded: appsmith.URL.queryParams.expanded ||  '',
		}, 'SAME_WINDOW');
		await resetWidget('ContainerInfo')
	},

	async handleSubmit(){
		await TokenValidator.validateToken();

		if (!this.isContact) {
			await insert_contacts.run({
				data: {
					PrincipalFestCloudID: maininfo.employeeID,
					EmailType: "Personal",
					PhoneType: "Personal",
					Email: emailInput.text?.trim() || '',
					PhoneNumber: utils.clearPhone(phoneInput.text)
				}
			})

			this.isContact = true;
		} else {
			await update_contacts.run({
				personId: maininfo.employeeID,
				data: {
					Email: emailInput.text?.trim() || '',
					PhoneNumber: utils.clearPhone(phoneInput.text)
				} 
			});
		}

		await update_person.run({
			personId: maininfo.employeeID,
			data: {
				Name: utils.capitalizeFirstLowerRest(nameInput.text),
				FamilyName: utils.capitalizeFirstLowerRest(familyNameInput.text),
				MiddleName: utils.capitalizeFirstLowerRest(middleNameInput.text),
				Gender: genderSelect.selectedOptionValue,
				Birthday: utils.formatDate(dateBirthday.selectedDate),
				DayOfBirth: moment(dateBirthday.selectedDate).format('MM-DD')
			}
		})

		switcher.showAlert();
	},
	
	async handlePhoneChange(){
		const {formatted, valid} = utils.formatPhone(phoneInput.text || this.beforeData.phoneNumber)

		this.isPhoneValid = valid;
		await phoneInput.setValue(formatted);
	},
}