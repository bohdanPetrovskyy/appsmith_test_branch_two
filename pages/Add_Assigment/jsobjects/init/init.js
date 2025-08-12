export default {
	fileData: null,
	pos: null,
	employeeFestCloudID: appsmith.URL.queryParams.employeeFestCloudID,
	link: "https://meta4-dev.srv.festcloud.ai",
	Profile_PageLink: "/uk/workspaces/7afcaeba-a984-453e-8bec-5b7df168403c/2ef74609-40bb-4657-9527-ad12bd4a45b6",

	async init() {
		await resetWidget('desktop')
		await resetWidget('DropzoneImage');

		await get_all__workgroups.run();
		await get_all__position.run();
		await get_all__dictionary.run();
		await get_managers.run();
		await get_contentitems.run();
		await get_roles_all.run();
	},

	async handleSelectFile(){
		this.fileData = DropzoneImage.files;

		await closeModal(uploadFotoMdl.name);
	},

	async handleCancelFile(){
		this.fileData = null;

		await closeModal(uploadFotoMdl.name);
		await resetWidget('DropzoneImage')		
	},

	async handleSubmit() {
		await TokenValidator.validateToken();
		await get_employee.run();

		let employeeFestCloudID = get_employee.data?.data?.employee[0]?.FestCloudID;
		let shouldCreateRole = false;

		// If its new person - we have to create employee
		if (!employeeFestCloudID) {
			await insert_employee.run();

			employeeFestCloudID = insert_employee.data?.data?.inserted?.returning[0]?.FestCloudID;

			if (!employeeFestCloudID) {
				showAlert('Employee not added.');
				return;
			}
			shouldCreateRole = true;

		} else {
			await update_employee.run({
				id: employeeFestCloudID
			})
		} 

		// Assignment will be created with that id
		init.employeeFestCloudID = employeeFestCloudID;
		await insert_role.run();

		// Assignment
		await insert_assignmentext.run();
		const assigmentFestCloudID = insert_assignmentext.data?.data?.inserted?.returning[0]?.FestCloudID;

		if (!assigmentFestCloudID) {
			// If we got emloyee id from queryParams - we cant delete it
			if (!appsmith.URL.queryParams.employeeFestCloudID) {
				await delete_people_employee.run({id: employeeFestCloudID}) 
			}

			showAlert('Assignment not added.');
			return;
		}

		// Adaptation
		await insert_adaptation.run();

		// Photo
		if (init.fileData?.length > 0) {
			await uploadFoto.run();
			await update_photoLink.run({
				festCloudID: employeeFestCloudID,
				photoLink: uploadFoto.data?.body[0]?.url,
			});
		}

		// Probation
		if (joinProbationChkbx.isChecked) {
			const dataDisposition = {
				AssignmentFestCloudID: assigmentFestCloudID,
				Type: "ProbationPeriod",
				EndDate: moment(endProbationDate.selectedDate).format('YYYY-MM-DD'),
				StartDate: moment(startDatePickerAssign.selectedDate).format('YYYY-MM-DD'),
			}

			await insert_disposition.run({
				dataDisposition
			})
		}

		// Access
		const dataAccess = utils.createAssigmentAccessPayload(assigmentFestCloudID);

		if (dataAccess?.length > 0) {
			await insert_contentitemvalues.run({
				dataAccess 
			})
		}

		const isWaiting = appsmith.URL.queryParams.returnTo === 'Waiting_List';

		if (isWaiting) {
			console.log('postwindow nav')
			postWindowMessage({ 
				data: { 
					path: `${this.Profile_PageLink}?employeeFestCloudId=${init.employeeFestCloudID}&isMyPage=false` 
				}, 
				type: "NAVIGATE" 
			}, 'window', `${this.link}`);
		} else {
			console.log('nav')
			await navigateTo("Profile_Page", {
				...appsmith.URL.queryParams, 
				storage: 'internal'},
											 "SAME_WINDOW")
			showAlert('Assignment added successfully!', 'success');
		}


		resetWidget("desktop");
	},
}
