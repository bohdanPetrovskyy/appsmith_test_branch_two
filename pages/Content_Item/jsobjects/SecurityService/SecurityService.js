export default {
	userPermissions: _.uniqBy(get_roles_user.data.flatMap(role => role.permissions), 'name').map(permission => permission.name),

	permissions: {
		"assignment_view": "assignment_view",
		"assignment_edit": "assignment_edit",
		"context_view": "context_view",
		"content_view": "content_view",
		"content_edit": "content_edit",
		"dictionary_view": "dictionary_view",
		"dictionary_edit": "dictionary_edit",
		"person_edit": "person_edit",
		"person_view": "person_view",
		"principal_view": "principal_view",
	},

	getRoleByPermission(permissionName) {
		const [entity, action] = permissionName.split("_");
		const userRole = get_roles_user.data.find(role => role.permissions.some(perm => action === "view"
			? perm.name.includes(entity)
			: perm.name === permissionName || perm.name === `${entity}_admin`));
		return userRole?.name || get_roles_user.data[0].name;
	}
}