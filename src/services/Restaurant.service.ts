import Restaurant from "../models/restaurant";

export const getRestaurantById = async (id: string) => {
    return await Restaurant.findById(id);
};

interface SearchParams {
    city: string;
    searchQuery?: string;
    selectedCuisines?: string;
    sortOption?: string;
    page?: number;
}

export const searchRestaurants = async ({
    city,
    searchQuery = "",
    selectedCuisines = "",
    sortOption = "lastUpdated",
    page = 1,
}: SearchParams) => {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const query: any = {};

    // 1. City Filter (Essential)
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) return { data: [], total: 0, pages: 1 };

    // 2. Cuisine Filter
    if (selectedCuisines) {
        const cuisinesArray = selectedCuisines
            .split(",")
            .map((cuisine) => new RegExp(cuisine, "i"));
        query["cuisines"] = { $all: cuisinesArray };
    }

    // 3. Search Query (Name or Cuisine)
    if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, "i");
        query["$or"] = [
            { restaurantName: searchRegex },
            { cuisines: { $in: [searchRegex] } },
        ];
    }

    // 4. Database Operations
    const restaurants = await Restaurant.find(query)
        .sort({ [sortOption]: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(); // Returns POJO (Plain Old JS Objects) for speed

    const total = await Restaurant.countDocuments(query);

    return {
        data: restaurants,
        total,
        pages: Math.ceil(total / pageSize),
    };
};
