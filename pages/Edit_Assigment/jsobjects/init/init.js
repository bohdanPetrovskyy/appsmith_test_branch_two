export default {
	// Delete condition
	employeeFestCloudId: appsmith.URL.queryParams.employeeFestCloudId,
	selectedAssigmentId: appsmith.URL.queryParams.selectedAssigmentId,
	fileData: null,
	isLoading: true,
	isFirstRender: true,
	beforeJobTitle: null,
	allAssignmentsRoles: null,

	async onPageLoad(){
		await TokenValidator.validateToken();
		await get_workgroups.run();
		await get_positions.run()
		await get_dictionaries.run();
		await get_assignments.run();
		await get_roles.run();
		await this.handleChangeAssignment(this.selectedAssigmentId);

		this.refreshRoles();
		
		await get_managers.run();
		this.isLoading = false;
	},

	async handleChangeAssignment(id){
		await TokenValidator.validateToken();
		await resetWidget('DropzoneImage')
		if (!this.isFirstRender && id === this.selectedAssigmentId) {
			return;
		}

		this.selectedAssigmentId = id;

		await get_one_assignment.run({
			id,
		});

		// To avoid query get_assignments
		this.beforeJobTitle = get_one_assignment.data?.data?.assignment[0]?.JobTitle || '';

		if (this.isFirstRender) {
			this.isFirstRender = false;
		}
	},

	async handleSubmit(){	
		try{
			await TokenValidator.validateToken();
			let photoLink = get_one_assignment.data?.data?.assignment[0]?.employee?.PhotoLink || '';

			// If user upload photo
			if (this.fileData?.length > 0) {
				await uploadFoto.run();
				photoLink = uploadFoto.data?.body[0]?.url;
			}

			const assigmentId = this.selectedAssigmentId;
			const employeeId = get_one_assignment.data?.data?.assignment[0]?.EmployeeFestCloudID;

			// Main block
			const dataAssigment = {
				WorkgroupFestCloudID: workgroupSelect.selectedOptionValue,
				JobTitle: jobTitleInput.text || '',
				Role: roleSelect.selectedOptionValue,
				ManagerFestCloudId: managerSelect.selectedOptionValue,
			};

			// Main block
			const dataAssigmentext  = {
				CooperationType: cooperationTypeSelect.selectedOptionValue,
			};

			// Main block
			const dataEmployee = {
				PhotoLink: photoLink
			};

			// Main block
			await update_one_assigment.run({
				assigmentId,
				employeeId,
				dataAssigment,
				dataAssigmentext,
				dataEmployee
			})

			if (update_one_assigment.data.errors) {
				throw new Error();
			};

			// Probation
			const beforeProbationDate = get_one_assignment.data?.data?.assignment[0]?.disposition[0]?.EndDate;
			const currentProbationDate = moment(probationEndDate.selectedDate).format('YYYY-MM-DD');
			if (responsibleCheckboxCopy.isChecked && beforeProbationDate !== currentProbationDate) {
				const dataDisposition = {
					EndDate: currentProbationDate
				};

				await update_disposition.run({
					id: this.selectedAssigmentId,
					dataDisposition
				});
			}

			const {
				candidatesToAdd, 
				candidatesToDelete,
				candidatesToUpdate,
			} = await utils.getAssigmentAccessPayload();

			// Access block
			if (candidatesToAdd?.length > 0) {
				await insert_contentitemvalues.run({
					dataAccess: candidatesToAdd
				})
			} 

			// Access block
			if (candidatesToDelete?.length > 0) {
				await delete_contentitemvalues.run({
					id: this.selectedAssigmentId,
					values: candidatesToDelete,
				})
			}

			// Access block
			if (candidatesToUpdate?.length > 0) {
				await update_contentitemsvalues.run({
					dataAccess: candidatesToUpdate
				})
			}

			showAlert('Інформація про місце роботи успішно оновлена', 'success')
			await insert_role.run();

			await get_assignments.run();
			this.refreshRoles();

			await get_one_assignment.run({
				id: this.selectedAssigmentId
			});

			// To avoid query get_assignments
			this.beforeJobTitle = get_one_assignment.data?.data?.assignment[0]?.JobTitle || '';

		} catch(error){
			showAlert('Щось пішло не так під час оновлення', 'error')
		}
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

	refreshRoles(){
		this.allAssignmentsRoles = get_assignments.data?.data?.assignments?.map(assignment => assignment.Role)
	}
}