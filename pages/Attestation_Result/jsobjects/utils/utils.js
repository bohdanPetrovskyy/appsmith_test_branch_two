export default {
	allAttestationList:[],
	personAttestationList: [],
	
	formatGoogleDriveUrl: (url) => {
		const regex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
		const match = url?.match(regex);
		return match?.[1] 
			? `https://drive.google.com/thumbnail?id=${match[1]}`
		: url;
	},


	onDecline: async function () {
		const newStage = 'OnboardingCancel';
		
		await update_people_stage.run(			{
			"where": {"FestCloudID": { "_eq": get_all_assigments.data.data.people_assignment_v0[0].FestCloudID}},
			"stage": newStage
		});

		navigateTo(appsmith.URL.queryParams.returnTo || "Profile_Page", {...appsmith.URL.queryParams, storage: 'internal'});
	},
	
	resultCounter: () => {
		const corretAnswers = this.personAttestationList.filter(item => item.Value === 'true').length;
		const allAnswers = this.allAttestationList.length;
		const percentage = 100 * corretAnswers / allAnswers;
		let passed = false;
		
		if (get_all_assigments.data.data.people_assignment_v0[0].assignment_positionfestcloudid_position.PositionName.toLowerCase() === 'офіціант' && percentage >= 80) {
			passed = true;
		} else if (percentage >= 60){
			passed = true; 
		}

		return {
			allAnswers,
			corretAnswers,
			wrongAnswers: allAnswers - corretAnswers,
			percentage,
			passed
		};
	},
		
	async createAttestationList() {
		if (JSON.parse(GetQuestionsFilter.data).data[0] === 'notUse') {
			this.personAttestationList = [];
			this.allAttestationList = [];
		} else {
			this.personAttestationList = get_all_assigments.data.data.people_assignment_v0[0].attestationItems.filter(item => GetQuestionsFilter.data.includes(item.contentitemvalue_contentitemfestcloudid_contentitem.ContentKey))
			this.allAttestationList = get_all_questions.data.data.people_contentitem_v0.filter(item => GetQuestionsFilter.data.includes(item.ContentKey))
		}
	},

	async handleNavigate(pageSlug, queryParams = {}){
		const employeeFestCloudId = appsmith.URL.queryParams.employeeFestCloudId || appsmith.store.myFestCloudId;
		const returnTo = 'Profile_Page'

		navigateTo(pageSlug, { employeeFestCloudId, returnTo, isMyPage: appsmith.URL.queryParams.isMyPage, checked: appsmith.URL.queryParams.checked,  expanded: appsmith.URL.queryParams.expanded, ...queryParams}, "SAME_WINDOW");
	},
}