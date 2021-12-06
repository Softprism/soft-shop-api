import Category from "../models/category.model.js";

//  Get all Categories
const getCategories = async (urlParams) => {
  try {
    if (urlParams.long && urlParams.lat && urlParams.radius) {
      var long = parseFloat(urlParams.long);
      var lat = parseFloat(urlParams.lat);
      var radian = parseFloat(urlParams.radius / 3963.2);
    }

    // declare fields to remove after aggregating
    const pipeline = [
      {
        $unset: ["stores"],
      },
    ];

    // start aggregate
    return (
      Category.aggregate()
        // lookup stores - trying to JOIN the categories and stores
        .lookup({
          from: "stores",
          // declare local variable for category id, since we're using version 4 of mongodb we can't use foreign and local fields here, hence doing it the OG way.
          let: { category_id: "$_id" },
          pipeline: [
            {
              // matching each category to a store, this should return all categories and a store array field inside each category object, an empty array if the category has no stores.
              $match: {
                $expr: {
                  $eq: ["$$category_id", "$category"],
                },
                // run geoWithin operation to return all stores that are within the selected radius of the user's location
                location: {
                  $geoWithin: {
                    $centerSphere: [[long, lat], radian],
                  },
                },
              },
            },
          ],
          as: "stores",
        })
        // count number of stores in each category, will return zero for empty arrays
        .addFields({
          storeCount: { $size: "$stores" },
        })
        // appends the pipeline specified above
        .append(pipeline)
    );
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

    return { msg: `${category.name} category successfully created` };
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

    if (!category) throw { err: "Category not found" };

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

    if (!category) throw { err: "Category not found" };

    // Remove category by id
    await Category.findByIdAndRemove(id);

    return { msg: "Category Deleted" };
  } catch (err) {
    return err;
  }
};

export { getCategories, createCategory, editCategory, deleteCategory };
