export default {
  organizeWorkgroups(workgroups) {
    const treeMap = new Map();

    workgroups.forEach(({ assignment_workgroupfestcloudid_workgroup }) => {
      this.addWorkgroup(
        assignment_workgroupfestcloudid_workgroup,
        treeMap
      )(assignment_workgroupfestcloudid_workgroup, treeMap);
    });

    const rootWorkgroups = [];

    treeMap.forEach((workgroup) => {
      if (
        !workgroup.workgroup_workgroupfestcloudid_workgroup &&
        workgroup.children &&
        workgroup.children.length > 0
      ) {
        // Сортування кореневих воркгруп
        workgroup.children.sort((a, b) => a.title.localeCompare(b.title));
        rootWorkgroups.push(workgroup);
      }
    });

    // Сортування самих кореневих воркгруп
    return rootWorkgroups.sort((a, b) => a.title.localeCompare(b.title));
  },

  addWorkgroup(inputWorkgroup, treeMap) {
    return function addWorkgroupToTree(inputWorkgroup, treeMap) {
      const {
        FestCloudID,
        Name,
        workgroup_workgroupfestcloudid_workgroup,
      } = inputWorkgroup;

      if (!treeMap.has(FestCloudID)) {
        treeMap.set(FestCloudID, {
          ...inputWorkgroup,
          id: FestCloudID,
          title: Name || "-----",
          key: FestCloudID,
          children: [],
        });
      }

      const currentWorkgroup = treeMap.get(FestCloudID);

      if (workgroup_workgroupfestcloudid_workgroup) {
        const parentInTree = addWorkgroupToTree(
          workgroup_workgroupfestcloudid_workgroup,
          treeMap
        );

        if (
          !parentInTree?.children?.some(
            (child) => child.id === currentWorkgroup.id
          )
        ) {
          if (!parentInTree.hasOwnProperty("children")) {
            parentInTree.children = [];
          }
          parentInTree.children.push(currentWorkgroup);

          // Сортуємо дітей кожного вузла одразу після додавання
          parentInTree.children.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
        }
      }

      return currentWorkgroup;
    };
  },
};
