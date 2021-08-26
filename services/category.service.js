import Category from '../models/category.model.js'

//  Get all Categories
const getCategories = async (urlParams) => {
	try {
    const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
    const pipeline = [{ 
      $unset: ['products']
    }];
    return Category.aggregate()
    .lookup({
      from: 'products',
      localField: '_id',
      foreignField: 'category',
      as: 'products'
    })
    .lookup({
      from: 'stores',
      localField: '_id',
      foreignField: 'category',
      as: 'stores'
    })
    .addFields({
      productCount: {$size: '$products'}
    })
    .addFields({
      storeCount: {$size: '$stores'}
    })
    .append(pipeline);

	} catch (err) {
		return err;
	}
};

// Create a new Category
const createCategory = async (categoryParams) => {
	const { name, image } = categoryParams;

	try {
		// Check if Category exists
		let category = await Category.findOne({ name });

		if (category) {
			throw { err: `${category.name} already Exists` };
		}

		// Create Category Object
		category = new Category({
			name,
			image,
		});

		// Save Category to db
		await category.save();

		return {msg: `${category.name} category successfully created`};
	} catch (err) {
		return err;
	}
};

// Edit a category
const editCategory = async (editParams, id) => {
	// const { name, image } = editParams;

	// // Build Category Object
	// const categoryFields = {};

	// // Check for fields
	// if (image) categoryFields.name = image;
	// if (name) categoryFields.name = name;
  
	try {
		let category = await Category.findById(id);

		if (!category) throw { err: 'Category not found' };

    // Images should be replaced

		// Check if image field is not empty
		// if (image !== '' || null) {
		// 	// Check if image array is not empty
		// 	if (!category.image.length < 1) {
		// 		// Set the image string value in category object to image found from db, then append new image string
		// 		categoryFields.image = [...category.image, image];
		// 	}
		// }

		// Updates the user Object with the changed values
		category = await Category.findByIdAndUpdate(
			id,
			{ $set: editParams },
			{ omitUndefined: true, new: true, useFindAndModify: false }
		);

		return category;
	} catch (err) {
		return err;
	}
};

//   Delete a Category
const deleteCategory = async (id) => {
	try {
		// Check if id matches any category from db
		let category = await Category.findById(id);

		if (!category) throw { err: 'Category not found' };

		// Remove category by id
		await Category.findByIdAndRemove(id);

		return { msg: 'Category Deleted' };
	} catch (err) {
		return err;
	}
};

export {
	getCategories,
	createCategory,
	editCategory,
	deleteCategory,
};
