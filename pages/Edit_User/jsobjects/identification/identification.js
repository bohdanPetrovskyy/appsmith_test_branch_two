export default {
	beforeData: null,
	isNew: false,
	isResidence: false,
	isRegistration: false,
	isCustomer: false,

	onPageLoad(){
		this.isNew = !get_identification.data?.data?.identification?.length;

		this.beforeData = {
			ipn: get_identification.data?.data?.identification[0]?.IndividualTaxpayerNumber,
			national: get_identification.data?.data?.identification[0]?.NationalID,
			local: get_identification.data?.data?.customer[0]?.LoyaltyCard ,
			militaryRegistration: get_identification.data?.data?.identification[0].MilitaryRegistration,
			residence: {
				country: get_identification.data?.data?.identification[0]?.residence?.Country ,
				city: get_identification.data?.data?.identification[0]?.residence?.City,
				street: get_identification.data?.data?.identification[0]?.residence?.Street,
				buildNumber: get_identification.data?.data?.identification[0]?.residence?.BuildingNumber,
				apartment: get_identification.data?.data?.identification[0]?.residence?.Apartment,
				postalCode: get_identification.data?.data?.identification[0]?.residence?.PostalCode
			},
			registation: {
				country: get_identification.data?.data?.identification[0]?.registration?.Country,
				city: get_identification.data?.data?.identification[0]?.registration?.City,
				street: get_identification.data?.data?.identification[0]?.registration?.Street,
				buildNumber: get_identification.data?.data?.identification[0]?.registration?.BuildingNumber,
				apartment: get_identification.data?.data?.identification[0]?.registration?.Apartment,
				postalCode: get_identification.data?.data?.identification[0]?.registration?.PostalCode
			},
		};
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
		const dataIdentification = {
			MilitaryRegistration: documentSelect.selectedOptionValue,
		};

		const dataRegistration = {
			Country: utils.capitalizeFirstLowerRest(RegistrationCountry.text) || '',
			City: utils.capitalizeFirstLowerRest(RegistrationCity.text) || '',
			Street: utils.capitalizeFirstLowerRest(RegistrationStreet.text) || '',
			PostalCode: RegistrationPostalCode.text || '',
			BuildingNumber: RegistrationBuildingNumber.text || '',
			Apartment: RegistrationApartment.text || ''
		};

		const dataCustomer = {
			LoyaltyCard: LocalCard.text || '',
		}

		const dataResidence = {
			Country: utils.capitalizeFirstLowerRest(ResidenceCountry.text) || '',
			City: utils.capitalizeFirstLowerRest(ResidenceCity.text) || '',
			Street: utils.capitalizeFirstLowerRest(ResidenceStreet.text) || '',
			PostalCode: ResidencePostalCode.text || '',
			BuildingNumber: ResidenceBuildingNumber.text || '',
			Apartment: ResidenceApartment.text || ''
		};

		await update_identification_all.run({
			personId: maininfo.employeeID,
			dataCustomer,
			dataIdentification,
			dataRegistration,
			dataResidence
		})

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
					PersonFestCloudID: maininfo.employeeID,
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
			id: get_identification.data?.data?.dms_tax[0].tax?.FestCloudID,
			dataTax: {
				IndividualTaxpayerNumber: taxpayerInput.text
			}
		})
	},

	async handleCreate(){
		const dataIdentification = {
			PersonFestCloudID: maininfo.employeeID,
			MilitaryRegistration: documentSelect.selectedOptionValue,
			identificationdata_registrationaddressfestcloudid_address: {
				data: {
					Country: utils.capitalizeFirstLowerRest(RegistrationCountry.text) || '',
					City: utils.capitalizeFirstLowerRest(RegistrationCity.text) || '',
					Street: utils.capitalizeFirstLowerRest(RegistrationStreet.text) || '',
					PostalCode: RegistrationPostalCode.text || '',
					BuildingNumber: RegistrationBuildingNumber.text || '',
					Apartment: RegistrationApartment.text || ''
				}
			},
			identificationdata_residenceaddressfestcloudid_address: {
				data: {
					Country: utils.capitalizeFirstLowerRest(ResidenceCountry.text) || '',
					City: utils.capitalizeFirstLowerRest(ResidenceCity.text) || '',
					Street: utils.capitalizeFirstLowerRest(ResidenceStreet.text) || '',
					PostalCode: ResidencePostalCode.text || '',
					BuildingNumber: ResidenceBuildingNumber.text || '',
					Apartment: ResidenceApartment.text || '',
				}
			},
		};

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
					PersonFestCloudID: maininfo.employeeID,
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
			id: get_identification.data?.data?.dms_tax[0].tax?.FestCloudID,
			dataTax: {
				IndividualTaxpayerNumber: taxpayerInput.text
			}
		})

		await insert_identification_all.run({
			dataIdentification,
		})

		await update_customer.run({
			personId: maininfo.employeeID,
			data: {
				LoyaltyCard: LocalCard.text || ''
			}
		});

		this.isNew = false;
	},
}