export default {
	isPhoneValid: false,
	isMyPage: appsmith.URL.queryParams.isMyPage,
	storage: 'internal',

	dismissalEmployee: null,
	assignmentEmployee: null,
	affiliationEmployee: null,
	employeeFestCloudId: appsmith.URL.queryParams.employeeFestCloudId,
	// 009f0abd-10df-4123-90a6-091e6e73fd9b
	// 53da021a-1c3c-4f5a-b22d-1e6cac840ef2 - returned staged
	existingID: '',
	phoneNumber: '',

	title: '',
	description: '',
	buttonLeft: '',
	buttonRight: '',
	willBeNewPerson: false,

	Profile_PageLink: "/uk/workspaces/7afcaeba-a984-453e-8bec-5b7df168403c/2ef74609-40bb-4657-9527-ad12bd4a45b6",
	link: "https://meta4-dev.srv.festcloud.ai",


	async onPageLoad(){
		await i18n.setup(appsmith.store.localization || "uk");
		await get_taxonomy.run();


		if (this.employeeFestCloudId) {
			await get_person_by_id.run();
			this.phoneNumber = get_person_by_id.data?.data?.person[0]?.principal?.contact[0]?.PhoneNumber
			this.handlePhoneChange();
		} else {
			await resetWidget('main');
			await resetWidget('identification');
		}
	},

	async handleSubmit(){
		await TokenValidator.validateToken();

		await get_email.run();

		const email = get_email.data?.data?.email[0]?.Email
		const beforeEmail = get_person_by_id.data?.data?.person[0]?.principal?.contact[0]?.Email

		if (email && email !== beforeEmail)  {
			showAlert("Користувач з таким e-mail уже існує", 'error')
			return;
		} 


		if (init.employeeFestCloudId) {
			this.handleUpdateExisting();
		} else {
			this.handleCheckExisting();
		}
	},

	async handleCreate(){
		this.willBeNewPerson = true;

		await insert_person.run({
			dataPerson: {
				FamilyName: familyNameInput.text,
				Name: nameInput.text,
				MiddleName: middleNameInput.text,
				Gender: genderSelect.selectedOptionValue,
				DayOfBirth: moment(datePicker.selectedDate).format('MM-DD'),
				Birthday: utils.formatDate(datePicker.selectedDate), 
			}
		});

		const PersonFestCloudID = insert_person.data?.data?.insert?.returning[0]?.FestCloudID;

		await insert_all_contacts.run({
			dataContact: [
				{
					PrincipalFestCloudID: PersonFestCloudID,
					EmailType: "Personal",
					PhoneType: "Personal",
					PhoneNumber: utils.clearPhone(phoneInput.text),
					Email: emailInput.text,
				},
				{
					PrincipalFestCloudID: PersonFestCloudID,
					EmailType: "Work",
					PhoneType: "Work",
					PhoneNumber: utils.clearPhone(phoneInput.text),
					Email: emailInput.text,
				}
			]
		});

		await insert_dms_tax.run({
			dataTax: {
				IndividualTaxpayerNumber: taxpayerInput.text,
				PersonFestCloudID,
				personaltaxdata_festcloudid_document: {
					data: {
						Name: "Індивідуальний податковий номер",
						TaxonomyFestCloudID: utils.getTaxonomyByName(utils.taxonomy.Individual_Tax_Number).FestCloudID
					}
				}
			}
		});

		const {series, number, taxonomyFestCloudID } = utils.getPassportFields();

		await insert_dms_id.run({
			dataId: {
				DocumentSeries: series,
				DocumentNumber: number,
				PersonFestCloudID,
				personaliddata_festcloudid_document: {
					data: {
						Name: "Паспорт громадянина України",
						TaxonomyFestCloudID: taxonomyFestCloudID,
					}
				}
			}
		})
		await this.handleNavigateBack();
	},

	async handleUpdateDuplicate() {		
		const personalInfo = get_person_by_fields.data.data.person[0]?.principal?.contact;

		if (this.dismissalEmployee) {
			// update people_employee_stage => Returned
			await update_employee.run({
				id: this.existingID,
				dataEmployee: {
					Stage: 'Returned',
				}
			})
		}

		if (personalInfo.length > 0){
			await update_personal_contacts.run({
				id: this.existingID,
				dataContact: {
					Email: emailInput.text,
					PhoneNumber:  utils.clearPhone(phoneInput.text)
				}
			});
		} else {
			await insert_personal_contacts.run({
				dataContact: {
					PrincipalFestCloudID: this.existingID,
					EmailType: "Personal",
					PhoneType: "Personal",
					PhoneNumber: utils.clearPhone(phoneInput.text),
					Email: emailInput.text,
				}
			});
		}

		await update_person.run({
			id: this.existingID,
			dataPerson: {
				Gender: genderSelect.selectedOptionValue
			}
		});

		const {series, number, taxonomyFestCloudID,  isNewPassport } = utils.getPassportFields();
		const isNewPassportExist = utils.getPassportByName(utils.taxonomy.ID_Cards);
		const isOldPassportExist = utils.getPassportByName(utils.taxonomy.Paper_Passport);


		if ((isNewPassport && isNewPassportExist) || (!isNewPassport && isOldPassportExist)) {
			const id = isNewPassport && isNewPassportExist ? isNewPassportExist.passport.FestCloudID : isOldPassportExist.passport.FestCloudID;

			await update_dms_id.run({
				id,
				dataPassport: {
					DocumentSeries: series,
					DocumentNumber: number
				}
			})
		} else{
			await insert_dms_id.run({
				dataId: {
					DocumentSeries: series,
					DocumentNumber: number,
					PersonFestCloudID: this.existingID,
					personaliddata_festcloudid_document: {
						data: {
							Name: "Паспорт громадянина України",
							TaxonomyFestCloudID: taxonomyFestCloudID,
						}
					}
				}
			})
		} 

		await update_dms_tax.run({
			id: get_person_by_id.data?.data?.dms_tax[0].tax?.FestCloudID,
			dataTax: {
				IndividualTaxpayerNumber: taxpayerInput.text
			}
		})

		this.handleNavigateBack();
	},

	async handleUpdateExisting() {
		const isContacts = get_person_by_id.data?.data?.person[0]?.principal?.contact?.length > 0

		const personId = init.employeeFestCloudId;

		if (isContacts) {
			await update_personal_contacts.run({
				id: personId,
				dataContact: {
					Email: emailInput.text,
					PhoneNumber:  utils.clearPhone(phoneInput.text)
				}
			});
		} else {
			await insert_personal_contacts.run({
				dataContact: {
					PrincipalFestCloudID: personId,
					EmailType: "Personal",
					PhoneType: "Personal",
					PhoneNumber: utils.clearPhone(phoneInput.text),
					Email: emailInput.text,
				}
			});
		}

		await update_person.run({
			id: personId,
			dataPerson: {
				Gender: genderSelect.selectedOptionValue
			}
		});

		const {series, number, taxonomyFestCloudID,  isNewPassport } = utils.getPassportFields();
		const isNewPassportExist = utils.getPassportByName(utils.taxonomy.ID_Cards);
		const isOldPassportExist = utils.getPassportByName(utils.taxonomy.Paper_Passport);


		if ((isNewPassport && isNewPassportExist) || (!isNewPassport && isOldPassportExist)) {
			const id = isNewPassport && isNewPassportExist ? isNewPassportExist.passport.FestCloudID : isOldPassportExist.passport.FestCloudID;

			await update_dms_id.run({
				id,
				dataPassport: {
					DocumentSeries: series,
					DocumentNumber: number
				}
			})
		} else{
			await insert_dms_id.run({
				dataId: {
					DocumentSeries: series,
					DocumentNumber: number,
					PersonFestCloudID: personId,
					personaliddata_festcloudid_document: {
						data: {
							Name: "Паспорт громадянина України",
							TaxonomyFestCloudID: taxonomyFestCloudID,
						}
					}
				}
			})
		} 

		await update_dms_tax.run({
			id: get_person_by_id.data?.data?.dms_tax[0].tax?.FestCloudID,
			dataTax: {
				IndividualTaxpayerNumber: taxpayerInput.text
			}
		})

		this.handleNavigateBack();
	},

	async handleCheckExisting(){
		await get_person_by_fields.run();

		const isEmployeeExist = get_person_by_fields.data?.data?.person?.length > 0;

		if (isEmployeeExist) {
			this.existingID = get_person_by_fields.data?.data?.person[0]?.FestCloudID;

			// First, check the black/gray lists
			const lists = ['blacklist', 'graylist']

			for (const list of lists) {
				const affiliation = get_person_by_fields.data?.data?.affiliations?.find(affiliation => affiliation.Type === list)

				if (affiliation){
					this.affiliationEmployee = {
						...affiliation,
						Label: list === 'blacklist' ? "Чорний список" : "Сірий список"
					}
					break;
				}
			}

			// If not found — check if the employee has an active assignment
			if (!this.affiliationEmployee) {
				const assignment = get_person_by_fields.data?.data?.person[0]?.employee?.assignment?.find(assignment => assignment?.EndDate === null);

				if (assignment) {
					this.assignmentEmployee = assignment;
				} else {
					this.dismissalEmployee = get_person_by_fields.data?.data?.person[0]?.employee?.assignment[0]
				}

				this.getCorrectText();
				await showModal(duplicateUserModal.name);
			} 
		} else {
			await this.handleCreate();

		}
	},

	async handleNavigateBack(){
		const returnTo = this.existingID && !this.dismissalEmployee ? 'Profile_Page' : 'Waiting_List' ;
		const id = this.existingID || this.employeeFestCloudId;

		if (this.willBeNewPerson) {
			showAlert('Нового працівника створено', 'success')
		} else {
			showAlert('Дані працівника оновлено', 'success')
		}

		if (returnTo === 'Profile_Page') {
			postWindowMessage({ 
				data: { 
					path: `${this.Profile_PageLink}?employeeFestCloudId=${id}&checked=${[...appsmith.URL.queryParams.checked].join('%2C')}&expanded=${[...appsmith.URL.queryParams.expanded].join('%2C')}&isMyPage=false` 
				}, 
				type: "NAVIGATE" 
			}, 'window', `${this.link}`);
		} else {
			await navigateTo(returnTo, {
				employeeFestCloudId: id, 
				isMyPage: this.isMyPage, 
				storage: this.storage,
				checked: appsmith.URL.queryParams.checked || '',
				expanded: appsmith.URL.queryParams.expanded ||  '',
			}, 'SAME_WINDOW');
		}
	},

	async handlePhoneChange(){
		const {formatted, valid} = utils.formatPhone(phoneInput.text || this.phoneNumber)

		init.isPhoneValid = valid;
		await phoneInput.setValue(formatted);
	},

	getPhoto(){
		const link = get_person_by_fields.data?.data?.person[0]?.employee?.PhotoLink;

		return utils.formatGoogleDriveUrl(link)
	},

	getCorrectText(){
		if (init.affiliationEmployee?.Label?.startsWith('Чорний')){
			this.title = "Обмеження для працевлаштування";
			this.description = "Повторне працевлаштування працівників з чорного списку неможливе, згідно з політикою компанії";
			this.buttonLeft = 'Це інша людина';
			this.buttonRight = "Зрозуміло";
		} else {

			if (init.affiliationEmployee?.Label?.startsWith('Сірий')) {
				this.title = 'Повторне працевлаштування';
			} else {
				this.title = 'Дублювання профілю';
			}

			this.description = "Щоб уникнути дублювання профілю - рекомендуємо перейти на цей профіль і додати його до нової команди"

			if (init.affiliationEmployee?.Label?.startsWith('Сірий')) {
				this.description = "Профіль працівника має статус 'сірий список'.\nПовторне працевлаштування можливе. " + this.description;
			}

			this.buttonLeft = 'Ні, створити новий';
			this.buttonRight = this.dismissalEmployee ? 'Так, відновити' : 'Так, перейти';
		}
	},

	resetModalField(){
		this.dismissalEmployee =  null;
		this.assignmentEmployee =  null;
		this.affiliationEmployee = null;
		this.existingID = null;
		closeModal(duplicateUserModal.name)
	},
}
