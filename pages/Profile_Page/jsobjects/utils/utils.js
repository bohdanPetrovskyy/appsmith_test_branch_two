export default {
	ukMonths: [
		"січня", "лютого", "березня", "квітня", "травня", "червня", 
		"липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
	],

	edLevels: 
	{
		"master": "Повна вища (Магістр)",
		"bachelor": "Неповна вища (Бакалавр)",
	},

	langLevels: {
		"A1": "A1 (Початківець)",
		"A2": "A2 (Елементарний)",
		"B1": "B1 (Середній)",
		"B2": "B2 (Вище середнього)",
		"C1": "C1 (Просунутий)",
		"C2": "C2 (Вільне володіння)",
	},

	langs: {
		"en": "Англійська",
		"ar": "Арабська",
		"bn": "Бенгальська",
		"vi": "В'єтнамська",
		"hi": "Хінді",
		"el": "Грецька",
		"he": "Іврит",
		"id": "Індонезійська",
		"es": "Іспанська",
		"it": "Італійська",
		"zh": "Китайська",
		"ko": "Корейська",
		"ms": "Малайська",
		"nl": "Нідерландська",
		"de": "Німецька",
		"no": "Норвезька",
		"pl": "Польська",
		"pt": "Португальська",
		"th": "Тайська",
		"tr": "Турецька",
		"uk": "Українська",
		"ur": "Урду",
		"fi": "Фінська",
		"fr": "Французька",
		"hr": "Хорватська",
		"cs": "Чеська",
		"sv": "Шведська",
		"ja": "Японська"
	},

	formatBirthday: (birthday) => {
		if (!birthday) {
			return "Дата не вказана"; // Повертаємо повідомлення, якщо дата не задана
		}
		const date = new Date(birthday);
		// Перевіряємо, чи дата є недійсною
		if (isNaN(date.getTime())) {
			return "Невірний формат дати"; // Повертаємо повідомлення, якщо дата недійсна
		}
		const day = date.getDate();
		const month = this.ukMonths[date.getMonth()];

		return `${day} ${month}`;
	},

	formatGoogleDriveUrl: (url) => {
		const regex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
		const match = url?.match(regex);
		return match?.[1] 
			? `https://drive.google.com/thumbnail?id=${match[1]}`
		: url;
	},

	normalizeDate(startDate , endDate) {
		const dateStart = moment(startDate);
		const currentDate = endDate ? moment(endDate) : moment();

		const startCopy = dateStart.clone();
		const years = currentDate.diff(startCopy, 'years');
		startCopy.add(years, 'years');

		const months = currentDate.diff(startCopy, 'months');
		startCopy.add(months, 'months');

		const days = currentDate.diff(startCopy, 'days');

		return {
			duration: `${years > 0 ? `${years} рік` : ""} ${months > 0 ? `${months} місяці` : ""} ${days > 0 ? `${days} днів` : ""}`.trim(),
			fullDuration: `${years} рік ${months} місяці ${days} днів`,
			startDate: `${dateStart.date()} ${this.ukMonths[dateStart.month()]} ${dateStart.year()}`,
			days,
			months,
			years
		}
	},

	roleTranslations: {
		manager: "Менеджер",
		GM: "Глобальний менеджер",
		worker: "Працівник",
		globaladmin: "Глобальний адміністратор",
		"fca-globaladmin": "Глобальний адміністратор FCA",
		"people-dev": "Розробник персоналу"
	},

	translateRole(role) {
		return this.roleTranslations[role] || role;
	},

	toggleActiveAssignment: async(newPrimaryFestCloudID) => {
		try {
			init.loading = true;
			await TokenService.validateToken();

			const primaryAssigmentIds = get_all_assignment.data?.data?.people_assignment_v0
			?.filter(assignment => assignment.assignment_festcloudid_assignmentext.Type === "Primary")
			.map(assignment => assignment.FestCloudID);
			
			await update_people_assignmentext_v0.run({
				FestCloudIDs: primaryAssigmentIds,
				Type: "Secondary"
			});

			await update_people_assignmentext_v0.run({
				FestCloudIDs: [newPrimaryFestCloudID],
				Type: "Primary"
			});

			const employeeFestCloudID = init.isMyPage ? appsmith.store.myFestCloudId : appsmith.store.currentFestCloudId;

			if (teamList.isVisible) {
				resetWidget('teamList');
			}

			await get_all_assignment.run({employeeFestCloudID});
		} catch (error) {
			console.error("Error fetching user data:", error);
			init.showCow = true
		} finally {
			init.loading = false;
		}
	},

	starState(type) {
		return type === 'Primary' 
			? {starColor:'#FFCA0E', isActive: false} 
		: {starColor:'#ffffff', isActive: true};
	},

	async uploadPhoto(){
		try{
			await TokenService.validateToken()

			// Uploading photo on Strapi
			await uploadPhoto.run()

			// Adding photo url from Strapi to DB
			await update_photo.run()

			showAlert('Photo uploaded successfully', 'success')
		}catch(error){
			showAlert('Something went wrong while uploading the photo. Please try again.', 'error')

		} finally {
			await closeModal(uploadFotoMdl.name);
			await resetWidget(uploadFotoMdl.name)

		}
	},

	async handleNavigate(pageSlug, queryParams = {}){
		const employeeFestCloudId = appsmith.URL.queryParams.employeeFestCloudId || appsmith.store.myFestCloudId;
		const returnTo = 'Profile_Page'

		navigateTo(pageSlug, { employeeFestCloudId, returnTo, isMyPage: init.isMyPage, checked: appsmith.URL.queryParams.checked,  expanded: appsmith.URL.queryParams.expanded, ...queryParams}, "SAME_WINDOW");
	},

	formatAdress({ City = '', Street = '', Country = '', BuildingNumber = '', Apartment = '' } = {}) {
		if (City.trim() === '' && Street.trim() === '' && Country.trim() === '') {
			return 'Невідомо';
		}
		return `м. ${City}, вул. ${Street} ${BuildingNumber}/${Apartment}, ${Country}`;
	},

	formatPreviousExperience(n = 0) {
		const StartDate = get_all_assignment?.data?.data?.people_assignment_v0[0]?.assignment_employeefestcloudid_employee?.employee_festcloudid_person?.workexperience_personfestcloudid_array[n].StartDate;
		const EndDate = get_all_assignment?.data?.data?.people_assignment_v0[0]?.assignment_employeefestcloudid_employee?.employee_festcloudid_person?.workexperience_personfestcloudid_array[n].EndDate;

		if (!StartDate || !EndDate) {
			return 'Невідомо';
		}
		return `${moment(StartDate).year()} - ${moment(EndDate).year()} (${moment(EndDate).diff(moment(StartDate), "years")} років)` 
	},

	formatCourseDate(date) {
		return moment(date, "YYYY-MM-DD").format("DD.MM.YYYY")
	}
};
