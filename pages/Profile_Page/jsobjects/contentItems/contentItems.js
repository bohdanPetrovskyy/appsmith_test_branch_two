export default {
	attestationNeedFor: ["Офіціант", "Кухар","Помічник офіціанта", "Касир торговельного залу", "Продавець непродовольчих товарів", "Бармен", "Бариста", "Заготівельник продуктів і сировини", "Кондитер",  
											 "Кондитер нічної зміни",  "Кухар гарячого цеху", "Кухар холодного цеху",  "Пекар", "Помічник кондитера", "Помічник кухаря", "Стюард",  "Сомельє"],
	adaptationItems: [],
	attestationItems: [],
	dismissalItems: [],

	async createItemsList () {
		this.adaptationItems = [];
		this.attestationItems = [];
		this.dismissalItems = [];
		
		get_all_assignment.data.data.people_assignment_v0.map(assignment => {
			const position = String(assignment.assignment_positionfestcloudid_position?.PositionName || assignment.JobTitle);
			const title = position + ' у ' + assignment.assignment_workgroupfestcloudid_workgroup?.Name;

			const item = {
				selectedAssigmentId: assignment.FestCloudID,
				title: title
			}

			if (assignment.assignment_festcloudid_assignmentext.Substage === "AdaptationCheckListPending") {
				this.adaptationItems.push(item);
			}

			if (assignment.assignment_festcloudid_assignmentext.Substage === "DismissalChecklistPending") {
				this.dismissalItems.push(item);
			}

			if (assignment.assignment_festcloudid_assignmentext.Substage === "AttestationCheckListPending" && this.attestationNeedFor.includes(position)) {
				this.attestationItems.push(item);
			}
		})
	}
}

