export default {
	toUpdate: [],
	toAdd: [],
	adaptationList: [],

	isAllChecked () {
		const checked = List1.currentItemsView.reduce(
			(count, item) => item.Checkbox1.isChecked ? count + 1 : count,
			0
		);

		return this.adaptationList.length === checked
	},

	atLeatOneChecked () {
		const checked = List1.currentItemsView.reduce(
			(count, item) => item.Checkbox1.isChecked ? count + 1 : count,
			0
		);

		return checked > 0;
	},

	formatGoogleDriveUrl: (url) => {
		const regex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
		const match = url?.match(regex);
		return match?.[1] 
			? `https://drive.google.com/thumbnail?id=${match[1]}`
		: url;
	},

	submitChanges: async function () {
		if (this.toAdd.length > 0) {
			await insert_contentitemvalues.run({ dataAccess: this.toAdd });
		}
		if (this.toUpdate.length > 0) {
			await update_contentitemsvalues.run({ dataAccess: this.toUpdate });
		}
	},

	onSubmit: async function () {
		const allChecked = this.isAllChecked();

		if (!allChecked) {
			try {
				await TokenValidator.validateToken();
				await this.submitChanges();
				await get_all_assigments.run();
				this.isAllChecked();
			} finally {
				this.toUpdate = [];
				this.toAdd = [];
			}
		} else {
			await TokenValidator.validateToken();
			await this.submitChanges();
			await update_assigment_substage.run();
			await SendAdaptationForm.run();
			utils.handleNavigate("Profile_Page", {storage: 'internal'});
		}
	},

	onDecline: async function () {
		const newStage = 'OnboardingCancel';

		await update_people_stage.run(			{
			"where": {"FestCloudID": { "_eq": get_all_assigments.data.data.people_assignment_v0[0].FestCloudID}},
			"stage": newStage
		});

		navigateTo(appsmith.URL.queryParams.returnTo || "Profile_Page", {...appsmith.URL.queryParams, storage: 'internal'});
	},

	isExist: (contentItemId) => {
		return get_all_assigments.data.data.people_assignment_v0[0].contentitemvalue_assignmentfestcloudid_array.find(item => item.ContentItemFestCloudID === contentItemId).Value === 'true' 
			? true 
		: false;
	},

	async checkToggle(contentItemId, isChecked) {
		const exist = get_all_assigments.data.data.people_assignment_v0[0].contentitemvalue_assignmentfestcloudid_array.find(item => item.ContentItemFestCloudID === contentItemId);

		if (!exist) {
			const index = this.toAdd.findIndex(item => item.ContentItemFestCloudID === contentItemId);
			const newItem = {
				AssignmentFestCloudID:  get_all_assigments.data.data.people_assignment_v0[0].FestCloudID,
				ContentItemFestCloudID: contentItemId,
				Value: String(isChecked),
			};

			if (index !== -1) {
				this.toAdd[index] = newItem;
			} else {
				this.toAdd.push(newItem);
			}
		} else {
			const index = this.toUpdate.findIndex(entry => entry.where.FestCloudID._eq === exist.FestCloudID);
			const newUpdate = {
				where: { FestCloudID: { _eq: exist.FestCloudID } },
				_set: { Value: String(isChecked) },
			};

			if (index !== -1) {
				this.toUpdate[index] = newUpdate;
			} else {
				this.toUpdate.push(newUpdate);
			}
		}
	},

	async createAdaptationList() {
		if (JSON.parse(GetActionFilter.data).data[0] === 'notUse') {
			this.adaptationList = [];
		} else {
			this.adaptationList = get_all_actions.data.data.people_contentitem_v0.filter(item => GetActionFilter.data.includes(item.ContentKey))
		}
	},

	async handleNavigate(pageSlug, queryParams = {}){
		const employeeFestCloudId = appsmith.URL.queryParams.employeeFestCloudId || appsmith.store.myFestCloudId;
		const returnTo = 'Profile_Page'

		navigateTo(pageSlug, { employeeFestCloudId, returnTo, isMyPage: appsmith.URL.queryParams.isMyPage, checked: appsmith.URL.queryParams.checked,  expanded: appsmith.URL.queryParams.expanded, ...queryParams}, "SAME_WINDOW");
	},
}