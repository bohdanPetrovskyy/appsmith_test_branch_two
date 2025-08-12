export default {

	deleteUser: async (PeopleToDelete) => {
		try {
			await TokenValidator.validateToken();

			const response = await delete_people_principal.run(PeopleToDelete); // Запуск мутації для видалення
			const affectedRows = response.data.delete_people_principal_v0.affected_rows;

			if (affectedRows > 0) {
				// Якщо є видалені рядки, виводимо успішне повідомлення
				showAlert('People Deleted', 'success');
			} else {
				// Якщо рядки не були видалені, виводимо повідомлення про помилку
				showAlert('Error: People not found or could not be deleted', 'error');
			}

			// Викликаємо інший запит для оновлення даних
			await get_all_people_person.run();

		} catch (error) {
			// Обробка помилок
			showAlert(`Error: ${error.message}`, 'error');
		}
	}


}