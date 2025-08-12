export default {
	loading: true,
	currentUser: null, 
	showCow: false,
	link: 'https://meta4.festcloud.ai',
	jwtValidayionLink: 'https://jwt-uat.api.festcloud.ai/hasura/refresh-token',
	Org_ChartLink: '/uk/workspaces/7afcaeba-a984-453e-8bec-5b7df168403c/8d2bd44a-5f61-47a8-bedd-ce256e2a0c1e',
	// TODO:
	// Profile_PageLink: '/uk/workspaces/8fe5edda-0f84-4cea-bd4c-9430414a5937/29fe3e1d-d53b-4cb2-b9c0-820da6a83726',
	isMyPage: appsmith.URL.queryParams.isMyPage === 'true' ? true : false,

	async init() {

		//////////////
		// hardcode to check in Editor

		// this.fetchProfileData("e7165fe3-239c-4656-9629-f88c3414569c");
		// await storeValue('loginedUser', "vyacheslav.pavlyuk@festcloud.ai");
		// await storeValue('accessToken', "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6InZ5YWNoZXNsYXYucGF2bHl1a0BmZXN0Y2xvdWQuYWkiLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6IndvcmtlciIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiZ2xvYmFsYWRtaW4iLCJtYW5hZ2VyIiwid29ya2VyIiwiZmNhLWdsb2JhbGFkbWluIl0sIlgtSGFzdXJhLVByaW5jaXBhbEZlc3RDbG91ZElEIjoiMDk2YzAzN2MtNjU2MS00ZjAwLWI1ZmEtOTlhYzJhNjg3MzZkIn0sImlhdCI6MTc1NDMxODU2MSwiZXhwIjoxNzU0MzIyMTYxfQ.Y4xMNYksSNSZ1dkNBYBK2xcutUFzmcZ2W0UdMfWHrOQ");
		// this.loading = false;
		//////////////

		const storage = appsmith.URL.queryParams.storage;
		if (storage) {
			if(this.isMyPage){
				await this.fetchData(appsmith.store.loginedUser)
			}
			else if (!this.isMyPage) {
				this.fetchProfileData(appsmith.URL.queryParams.employeeFestCloudId);
				this.loading = false;
			}
		}

		postWindowMessage({id:'fca_people_profilePage', data: {isMounted:true}, type: "MOUNT"}, 'window', this.link);
		windowMessageListener(this.link, async ({data, type}) => {
			if (type === "INIT") {
				const { accessToken, refreshToken, email, roles, lang, deviceType } = data;
				console.log({data, type})
				const userRole = roles.includes('manager') ? "admin" : "user"

				await storeValue('loginedUser', email);
				await storeValue('localization', lang);
				await storeValue('userRole', userRole);
				await storeValue('deviceType', deviceType);

				if (accessToken && refreshToken) {
					await storeValue('accessToken', accessToken);
					await storeValue('refreshToken', refreshToken);
				}

				const employeeFestCloudID = appsmith.URL.queryParams.employeeFestCloudId || null;
				if (employeeFestCloudID && employeeFestCloudID !== appsmith.store.myFestCloudId) {
					this.isMyPage = false;
					try {

						this.fetchProfileData(employeeFestCloudID);
						await storeValue('currentFestCloudId', employeeFestCloudID);
					} catch(error) {
						console.error("Error fetching user data:", error);
						this.showCow = true
					} finally {
						this.loading = false;
					}

				} else {

					this.isMyPage = true;
					await this.fetchData(email);
				}

				if (type === "RESIZE") {
					const { deviceType } = data;
					storeValue('deviceType', deviceType);
				}
			}
		});					
	},

	async fetchProfileData (id) {
		await TokenService.validateToken();
		await get_roles_user.run();
		await get_all_assignment.run({employeeFestCloudID: id})
		await contentItems.createItemsList();
	},

	async fetchData(workEmail) {
		try {
			await TokenService.validateToken();
			await get_roles_user.run();
			const response = await get_user_byEmail.run({ workEmail });

			if (response.data.people_contact_v0 && response.data.people_contact_v0.length > 0) {
				// По збереженому з клеймсів мейлу витягуємо фестклаудайді
				const employeeFestCloudID = response.data.people_contact_v0[0].PrincipalFestCloudID;
				storeValue('myFestCloudId', employeeFestCloudID);

				await get_all_assignment.run({employeeFestCloudID});
				await contentItems.createItemsList();
				await utils.translateRole();

			} else {
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			this.showCow = true
		} finally {
			this.loading = false;
		}
	}
} 