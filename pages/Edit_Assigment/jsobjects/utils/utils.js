export default {
	contentItemsKey: {
		RequiresPC: "RequiresPC",
		RequiresCorporateEmail: "RequiresCorporateEmail",
		RequiresMailGroupAccess: "RequiresMailGroupAccess",
		RequiresAccessServer: "RequiresAccessServer",
		Requires1CAcces: "Requires1CAcces",
		RequiresRoomAccess: "RequiresRoomAccess",
		RequiresJiraAccess: "RequiresJiraAccess",
		RequiresPowerBIAccess: "RequiresPowerBIAccess",
		RequiresVideoMonitoringAccess: "RequiresVideoMonitoringAccess",
		RequiresSpartaAccess: "RequiresSpartaAccess",
		RequiresCleverStaffAccess: "RequiresCleverStaffAccess",
		RequiresClickUpAccess: "RequiresClickUpAccess",
	},

	getDictionaryByName(dictionaryName) {
		return get_dictionaries.data?.data?.dict?.filter(d => d.DictionaryName === dictionaryName)
	},

	getContentItemByKey(contentItemKey, isExist = true) {
		return isExist 
			? get_one_assignment.data?.data?.assignment[0]?.content_items.filter(item => item?.content_item?.ContentKey === contentItemKey)
		: get_contentitems.data?.data?.content_items?.filter(item => item.ContentKey === contentItemKey)
		;
	},

	async getAssigmentAccessPayload() {
		const access = access_form.data;

		let allCandidatesToDelete = [];
		let allCandidatesToAdd = [];
		let allCandidatesToUpdate = [];

		for (const key in access) {
			if (key.startsWith('Text')) {
				continue;
			}

			if (Array.isArray(access[key])) {
				const beforeData = this.getContentItemByKey(key).map(item => item.Value)
				const currentData = access[key]
				const candidatesToDelete = [];
				const candidatesToAdd = [];

				const max = Math.max(beforeData.length, currentData.length)

				for (let i = 0; i < max; i++) {
					if (beforeData[i] && !currentData.includes(beforeData[i])) {
						candidatesToDelete.push(beforeData[i]);
					} else if (!beforeData[i] && currentData[i]) {
						await get_contentitems.run();

						candidatesToAdd.push({
							AssignmentFestCloudID: init.selectedAssigmentId, 
							ContentItemFestCloudID: this.getContentItemByKey(key, false)[0]?.FestCloudID, 
							Value: currentData[i]
						})
					}
				}

				allCandidatesToDelete = [...allCandidatesToDelete, ...candidatesToDelete];
				allCandidatesToAdd = [...allCandidatesToAdd, ...candidatesToAdd];
			} else {
				
				// Doesn`t matter string/boolean, cause we are saving Value that has to be string
				const currentData = access[key];
				const beforeData = this.getContentItemByKey(key)[0]?.Value
				const isEqual = String(currentData) === beforeData;
				
				console.log("HERE", currentData)

				if (beforeData && !isEqual) {
					allCandidatesToUpdate.push({
						where: {
							FestCloudID: {_eq: this.getContentItemByKey(key)[0]?.FestCloudID}
						},
						_set: {
							Value: String(currentData)
						}
					})
				}
			} 
		}

		return {
			candidatesToDelete: allCandidatesToDelete, 
			candidatesToAdd: allCandidatesToAdd,
			candidatesToUpdate: allCandidatesToUpdate
		}; 
	},

	formatGoogleDriveUrl(url){
		const regex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
		const match = url?.match(regex);

		return match?.[1] 
			? `https://drive.google.com/thumbnail?id=${match[1]}`
		: url;
	},

	photoVisible(){
		const file = DropzoneImage.files[0];

		if (!file) {
			return null;
		}

		const correctSize = () => {
			const size = DropzoneImage.files[0].size;

			if (size < 1024) {
				return `${size} Б`
			} else if (size < 1024 * 1024) {
				return `${(size / 1024).toFixed(1)} КБ`;
			} else {
				return `${(size / (1024 * 1024)).toFixed(1)} МБ`
			}
		}

		return{
			data: file.data,
			name: file.name,
			size: correctSize(),
		}
	},
}