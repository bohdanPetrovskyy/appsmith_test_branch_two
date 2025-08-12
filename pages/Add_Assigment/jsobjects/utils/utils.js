export default {
	getDictionaryByName(dictionaryName) {
		return get_all__dictionary?.data?.data?.dict?.filter(d => d.DictionaryName === dictionaryName)
	},

	getContentItemByKey(contentItemKey) {
		return get_contentitems.data?.data?.content_items?.filter(item => item.ContentKey === contentItemKey);
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

	createAssigmentAccessPayload (AssignmentFestCloudID) {
		const allAccessData = access_form.data;
		const payload = [];
		for(const accessKey in allAccessData) {
			if (accessKey.startsWith('Text')) {
				continue;
			}
			
			if(Array.isArray(allAccessData[accessKey])) {
				allAccessData[accessKey].map(key => payload.push({
					AssignmentFestCloudID, 
					ContentItemFestCloudID: this.getContentItemByKey(accessKey)[0]?.FestCloudID, 
					Value: key}))
			}  else {
				payload.push({
					AssignmentFestCloudID, 
					ContentItemFestCloudID: this.getContentItemByKey(accessKey)[0].FestCloudID, 
					Value: String(allAccessData[accessKey])})
			}
		}
		return payload
	},

	async createPos(){
		const code = Math.floor(1000 + Math.random() * 9000).toString();
		const splitedCode = code.split('');

		await pos4.setValue(splitedCode[0]);
		await pos3.setValue(splitedCode[1]);
		await pos2.setValue(splitedCode[2]);
		await pos1.setValue(splitedCode[3]);

		init.pos = code;
	},

	async clearPos() {
		await pos4.setValue('');
		await pos3.setValue('');
		await pos2.setValue('');
		await pos1.setValue('');

		init.pos = null;
	}
}
