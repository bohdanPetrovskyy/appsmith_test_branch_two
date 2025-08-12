export default {
	fileExcel: null,
    fileName: 'інфо_працівники.xlsx',
    limitExcel: 500,
    isExcelLoading: false,
		stages: get_all_stages.data.data.people_assignmentext_v0.map(item => item.Stage),

    // Running new request to build Excel file
    async configureExcel(){
        const total = get_all_assignments.data.data.people_assignment_v0_aggregate.aggregate.count
        this.isExcelLoading = true;
        
        if (total > this.limitExcel) {
            throw new Error(`Ви перевищили максимальну к-сть людей для завантаження (${this.limitExcel})`)
            return
        }
        
        
        this.limitExcel = total;
        showAlert('Готуємо файл до завантаження...', 'info')

        // We have to run new query for not blinking the assignesList
        const { data } = await get_all_assignments_excel.run();
        
        this.limitExcel = 500;

        // We have to filter data that we need. Key -> future column name, Value -> future column value
        const normalizedData = data.people_assignment_v0.map(item => ({
						'Прізвище': item.assignment_employeefestcloudid_employee.employee_festcloudid_person?.FamilyName || '-',
            'Імʼя': item.assignment_employeefestcloudid_employee.employee_festcloudid_person?.Name || '-',
            'По-батькові': item.assignment_employeefestcloudid_employee.employee_festcloudid_person?.MiddleName || '-' ,
            'Посада': item.assignment_positionfestcloudid_position?.PositionName || '-',
            'Пошта': item.assignment_employeefestcloudid_employee.employee_festcloudid_person.person_festcloudid_principal.WorkEmail[0]?.Email || '-',
            'Номер телефону': item.assignment_employeefestcloudid_employee.employee_festcloudid_person.person_festcloudid_principal.WorkPhone[0]?.PhoneNumber || '-',
            'Робоча група': item.assignment_workgroupfestcloudid_workgroup?.Name || '-',
        }))

        // Converting array of object to excel list
        const ws = XLSX.utils.json_to_sheet(normalizedData);

        // New workbook
        const wb = XLSX.utils.book_new();

        // Adding a list ws to workbook wb with name 'Лист1.'. If we need - we can add more lists to one workbook
        XLSX.utils.book_append_sheet(wb, ws, "Лист1");

        // Generating Excel-file like base64 string for correct work. 
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

        // For download this file on click
        this.fileExcel =  `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    },

    async downloadExcel(){
        try{
            await this.configureExcel();
            showAlert(`Завантаження файлу ${this.fileName} розпочалось`, 'info')
            download(this.fileExcel, this.fileName);
        }catch(error){
            if (error.message) {
                showAlert(error.message, 'error')
            } else {
                showAlert(`Щось пішло не так під час завантаження файлу ${this.fileName}`, 'error')
            }
        } finally {
            this.isExcelLoading = false;
        }
    },

	getWorkgroupAncestry(workgroups, targetId) {
		const idMap = new Map();
		
		for (const item of workgroups) {
			idMap.set(item.assignment_workgroupfestcloudid_workgroup.FestCloudID, item);
		}
		
		const path = [];
		let currentId = targetId;

		while (currentId) {
			path.push(currentId);
			const currentNode = idMap.get(currentId).assignment_workgroupfestcloudid_workgroup;
			if (!currentNode || !currentNode.WorkgroupFestCloudID) break;
			currentId = currentNode.WorkgroupFestCloudID;
		}

		return path;
	},
	formatGoogleDriveUrl: (url) => {
		const regex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
		const match = url?.match(regex);
		return match?.[1] 
			? `https://drive.google.com/thumbnail?id=${match[1]}`
		: url;
	},

};
