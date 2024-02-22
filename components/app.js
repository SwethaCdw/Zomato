import { ordersData, restaurantsData, userData } from '../services/zomato-services.js';
import { APP_CONSTANTS } from '../constants/app-constants.js';

/**
 * Identify which day more items are sold, and print weekday sale or weekend sale based on day
 * 
 */
function getMaxSaleDetails(){
    const orders = ordersData;
    let itemsSoldByDate = getItemsSoldByDate(orders);
    console.log('itemsSoldByDate', itemsSoldByDate);
    
    let maxDayDetail = getMaxSoldDayDetail(itemsSoldByDate);

    console.log("Max Items sold date : ",maxDayDetail);
    
    if(APP_CONSTANTS.WEEK_DAYS.find(item => item === maxDayDetail.maxDay.toUpperCase())){
        let weekdaySale = getWeekDayAndWeekendSale(APP_CONSTANTS.WEEKDAY_KEY, orders);
        console.log(`WEEKDAY SALE: Rs.${weekdaySale}`);
    } else {
        let weekendSale = getWeekDayAndWeekendSale(APP_CONSTANTS.WEEKEND_KEY, orders);
        console.log(`WEEKEND SALE: Rs.${weekendSale}`);
    }
                
}

/**
 * Find which date has the most items quantity
 * @param {*} itemsSoldByDate list of date with quantity
 * @returns maxDayDetail
 */
function getMaxSoldDayDetail(itemsSoldByDate) {
    let maxDate = null;
    let maxItemsSold = 0;
    
    for (let date in itemsSoldByDate) {
        if (itemsSoldByDate[date] > maxItemsSold) {
            maxItemsSold = itemsSoldByDate[date];
            maxDate = date;
        }
    }

    let maxDay = new Date(maxDate).toLocaleString('en-US', {weekday : 'long'});

    let maxDayDetail = {
        maxDay : maxDay,
        maxDate : maxDate
    }

    return maxDayDetail;
}

//get the price in the object - would reduce the number of iternations

/**
 * 
 * @param {*} dayType weekday or weekend
 * @param {*} orders orders data
 * @returns weekdaySale/weekendSale
 */
function getWeekDayAndWeekendSale(dayType, orders) {
    let weekdaySale = 0;
    let weekendSale = 0;
       
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getDay() >= 1 && orderDate.getDay() <= 5) {
            weekdaySale += order.price 
        } else {
            weekendSale += order.price 
        }
    });

    return dayType === 'WEEKDAY' ? weekdaySale : weekendSale;
}

/**
 * 
 * @param {*} orders 
 * @returns the list of dates with corresponding quanitity
 */
function getItemsSoldByDate(orders) {
    return orders.reduce((obj, order) => {

        let { date, quantity } = order;
        if (obj[date]) {
            obj[date] += quantity;
        } else {
            obj[date] = quantity;
        }
        return obj;
    }, {});
}

//2

/**
 * How many users placed same order and print details of users & order details
 */
function checkDuplicateOrders() {
    const orders = ordersData;
    const orderMap = new Map();
    const orderDetails = [];
    const usersMap = new Map();

    for (const user of userData) {
        usersMap.set(user.id, user.name);
    }

    for (const order of orders) {
        let userIds = new Set();
        const key = order.item + "-" + (order.drink || "");
        const existingOrders = orderMap.get(key) || [];
        if(existingOrders.length !== 0){
            existingOrders.forEach(existingOrder => {
                userIds.add(existingOrder.userId);
            })
        }
        if(!userIds.has(order.userId)){
            existingOrders.push(order);
            orderMap.set(key, existingOrders);
        }
    }

    orderMap.forEach((value, key) => {
        if (value.length > 1) {
            const userDetails = value.map(order => usersMap.get(order.userId));
            orderDetails.push({ userDetails, orderDetails: key });
        }
    });

    console.log(" Order details:", orderDetails);
}

/**
 * Identify restaurant which did sell highest
 * 
 */
function getHighSaleRestaurant() {
    const orders = ordersData;
    const restaurantSalesMap = new Map();

    getRestaurantSalesMap(restaurantSalesMap, orders);

    const { highestSales, highestSellingRestaurant } = getHighestSaleRestaurantDetails(restaurantSalesMap);

    console.log(`Highest Sales Restaurant Name : ${highestSellingRestaurant} Sale Price : ${highestSales}`);
}

/**
 * To get the restaurant and the total price
 * @param {*} restaurantSalesMap 
 * @param {*} orders 
 */

function getRestaurantSalesMap(restaurantSalesMap, orders) {
    orders.forEach(order => {
        const { restaurant_name, price } = order;

        if (restaurantSalesMap.has(restaurant_name)) {
            restaurantSalesMap.set(restaurant_name, restaurantSalesMap.get(restaurant_name) + price);
        } else {
            restaurantSalesMap.set(restaurant_name, price);
        }
    });
}

/**
 * 
 * @param {*} restaurantSalesMap 
 * @returns highestSales & highestSellingRestaurant
 */
function getHighestSaleRestaurantDetails(restaurantSalesMap) {
    let highestSales = 0;
    let highestSellingRestaurant = '';

    restaurantSalesMap.forEach((totalSales, restaurantName) => {
        if (totalSales > highestSales) {
            highestSales = totalSales;
            highestSellingRestaurant = restaurantName;
        }
    });

    return { highestSales, highestSellingRestaurant };
}

/**
 * Identify restaurants which did not sell yet
 * 
 */
function getUnSoldRestaurant() {
    const orders = ordersData;
    const restaurantInfo = restaurantsData;

    const soldRestaurantNames = new Set(orders.map(order => order.restaurant_name.toUpperCase()));
    const unsoldRestaurants = restaurantInfo.filter(restaurant => !soldRestaurantNames.has(restaurant.name.toUpperCase()))
                                            .map(restaurant => restaurant.name);
    console.log("Restaurants that did not make any sales:" ,unsoldRestaurants);
}

/**
 * Identify Restaurants List which serve exact similar foods
 * 
 */
function getRestaurantWithSameItems() {
    const foodMap = new Map();
    const restaurants = restaurantsData;

    restaurants.forEach(({ name, food }) => {
        const foodKey = food.sort().join('-'); 
        if (!foodMap.has(foodKey)) {
            foodMap.set(foodKey, [name]);
        } else {
            foodMap.get(foodKey).push(name);
        }
    });

    const similarRestaurants = Array.from(foodMap.values())
        .filter(restaurants => restaurants.length > 1);

    console.log("Restaurants serving exactly similar foods:");
    console.log(similarRestaurants);
}

/**
 * Identify how many users ordered both food item & beverage
 */
function getUsersWithFoodAndBeverage() {
    const orders = ordersData;

    const usersWithFoodAndBeverage = new Set(
        orders.filter(order => (
            order.item && order.item.trim() !== '' && 
            order.drink && order.drink.trim() !== '' 
        )).map(order => order.userId)
    );
    
    const numberOfUsers = usersWithFoodAndBeverage.size;
    console.log(`Number of users who ordered both food and beverage: ${numberOfUsers}`);
}

/**
 * Given any restaurant name & item name identify how many sold
 */
function getSoldQuantityInfo() {
    const orders = ordersData;
    const restaurantName = prompt('Please enter the restaurant name'); //Honest John Pizza
    const itemName = prompt('Please enter the food item name'); //cheese pizza

    if(restaurantName.length !== 0 || itemName.length !== 0){
        const totalSold = orders.reduce((total, order) => {
            if (order.restaurant_name === restaurantName && order.item === itemName) {
                total += order.quantity;
            }
            return total;
        }, 0);
    
        console.log(`Total ${itemName} sold at ${restaurantName}: ${totalSold}`);
    } else {
        console.log('Invalid input. Please enter valid restaurant name or item name');
    }
    
}

/**
 * Which all restaurants serve given beverage or food
 */
function getRestaurantInfo() {
    const restaurantData = restaurantsData;
    const itemToFind = prompt('Please enter the beverage/food item name'); 

    console.log(itemToFind);
    if (!itemToFind.length !== 0) {
        const restaurantsServingItem = restaurantData
        .filter(restaurant => restaurant.food.includes(itemToFind) || restaurant.beverages.includes(itemToFind))
        .map(restaurant => restaurant.name);

        console.log(`Restaurants serving ${itemToFind}:`);
        console.log(restaurantsServingItem);
    } else {
        console.log('Invalid input. Please enter valid beverage/food item name');
    }
}

/**
 * Sort orders by date
 */
function sortOrdersByDate() {
    const userInput = prompt('Do you want to sort in ASC/DESC?');

    const orders = ordersData;
    const ordersWithUpdatedDate = orders.map(obj => ({ ...obj, date: new Date(obj.date) }));

    let sortedOrders;
    if (userInput === 'ASC' || userInput === 'DESC') {
        const sortOrder = userInput === 'ASC' ? 1 : -1;
        sortedOrders = ordersWithUpdatedDate.sort((prevOrder, nextOrder) => {
            return sortOrder * (prevOrder.date - nextOrder.date);
        });
        const orderMap = new Map(sortedOrders.map((order, index) => [order.id, index]));
        console.log(`Sorted Orders in ${userInput === 'ASC' ? 'Ascending' : 'Descending'}`, 
                    orders.sort((prevOrder, nextOrder) => orderMap.get(prevOrder.id) - orderMap.get(nextOrder.id)));
    } else {
        console.log('Invalid input. Please enter either "ASC" or "DESC".');
    }
    return sortedOrders;
}




document.getElementById("button-container").addEventListener("click", function(event) {
    const buttonId = event.target.id;

    switch (buttonId) {
        case "1":
            getMaxSaleDetails();
            break;
        case "2":
            checkDuplicateOrders();
            break;
        case "3":
            getHighSaleRestaurant();
            break;
        case "4":
            getUnSoldRestaurant();
            break;
        case "5":
            getRestaurantWithSameItems();
            break;
        case "6":
            getUsersWithFoodAndBeverage();
            break;
        case "7":
            getSoldQuantityInfo();
            break;
        case "8":
            getRestaurantInfo();
            break;
        case "9":
            sortOrdersByDate();
            break;
        default:
            break;
    }
});
