export default {
	loading: true,
	currentUser: null, 
	showCow: false,
	treeData: [],
	link: "https://meta4.festcloud.ai",
	tokenRefresh: "https://jwt-uat.api.festcloud.ai/hasura/refresh-token",
	Profile_PageLink: "/uk/workspaces/7afcaeba-a984-453e-8bec-5b7df168403c/2ef74609-40bb-4657-9527-ad12bd4a45b6",

	async init() {
		postWindowMessage({id: 'fca_people_orgChart', data: {isMounted: true}, type: "MOUNT"}, 'window', this.link);

		const userEmail = appsmith.store.loginedUser;

		if (userEmail) {
			await this.fetchData(userEmail);
		} else {
			windowMessageListener(this.link, async ({data, type}) => {
				if (type === "INIT") {
					const { accessToken, refreshToken, email, roles, lang, deviceType } = data;

					const userRole = roles.includes('manager') ? "admin" : "user"

					await storeValue('loginedUser', email);
					await storeValue('localization', lang);
					await storeValue('userRole', userRole);
					await storeValue('deviceType', deviceType);

					if (accessToken && refreshToken) {
						// зберігання токенів
						storeValue('accessToken', accessToken);
						storeValue('refreshToken', refreshToken);
					}

					if(email) {
						await this.fetchData( email);
					} 
				}

				if (type === "RESIZE") {
					const { deviceType } = data;
					storeValue('deviceType', deviceType);
				}
			});
		}
	},

	async fetchData( workEmail ) {
		try {
			await TokenValidator.validateToken()
			await get_roles_user.run();
			await get_workgroups.run();
			const workGroupList = get_workgroups.data.data.people_assignment_v0
			const data = await TreeMaker.organizeWorkgroups(workGroupList);
			this.treeData = data

			if(typeof get_all_userData_byEmail.run!=='function') return

			const response = await get_all_userData_byEmail.run({ workEmail: workEmail });

			if (response.data.people_contact_v0 && response.data.people_contact_v0.length > 0) {
				// По збереженому з клеймсів мейлу витягуємо фестклаудайді
				const employeeFestCloudId = response.data.people_contact_v0[0].PrincipalFestCloudID;

				if(typeof get_all_data_about_user.run!=='function') return
				await get_all_data_about_user.run({
					"employeeFestCloudID": employeeFestCloudId
				});

				const workgroupId =  get_all_data_about_user.data.data.people_assignment_v0[0].WorkgroupFestCloudID
				if (workgroupId && !appsmith.URL.queryParams.checked && !appsmith.URL.queryParams.expanded) {
					await Workgroup_Tree.setCheckedOptions([workgroupId])
					const expandedWorkgroups = utils.getWorkgroupAncestry(workGroupList, workgroupId)
					await Workgroup_Tree.setExpandedOptions(expandedWorkgroups)

					debData.prevCheck = [workgroupId] // save to memory for Tree trigger func
				} else {
					debData.prevCheck = appsmith.URL.queryParams.checked.split(',')
					await Workgroup_Tree.setCheckedOptions(debData.prevCheck)
					await Workgroup_Tree.setExpandedOptions(appsmith.URL.queryParams.expanded.split(','))
				}

				if(typeof get_all_assignments.run!=='function') return
				await get_all_assignments.run()
				this.loading = false;
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			// this.showCow = true
		} finally {
			this.loading = false;
		}
	}
} 