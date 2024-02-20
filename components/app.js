import { ordersData, restaurantsData, userData } from '../services/zomato-services.js';
import { APP_CONSTANTS } from '../constants/app-constants.js';

/**
 * Identify which day more items are sold, and print weekday sale or weekend sale based on day
 * 
 */
function getMaxItemSoldDay(){
    const orders = ordersData;
    let itemsSoldByDate = orders.reduce((obj, order) => {

        let { date, quantity } = order;
        if (obj[date]) {
            obj[date] += quantity;
        } else {
            obj[date] = quantity;
        }
        return obj;
    }, {});
    
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

    let weekdaySale = 0;
    let weekendSale = 0;

    console.log("Max Items sold date : ",maxDayDetail);
       
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getDay() >= 1 && orderDate.getDay() <= 5) {
            weekdaySale += order.price * order.quantity;
        } else {
            weekendSale += order.price * order.quantity;
        }
    });
    if(APP_CONSTANTS.WEEK_DAYS.find(item => item === maxDay.toUpperCase())){
        console.log('WEEKDAY SALE: ', weekdaySale);
    } else {
        console.log('WEEKEND SALE: ', weekendSale);
    }
            
       
}

/**
 * Identify restaurant which did sell highest
 * 
 */
function getHighSaleRestaurant() {
    const orders = ordersData;
    const restaurantSalesMap = new Map();

    orders.forEach(order => {
        const { restaurant_name, price, quantity } = order;
        // const totalPrice = price * quantity;

        if (restaurantSalesMap.has(restaurant_name)) {
            restaurantSalesMap.set(restaurant_name, restaurantSalesMap.get(restaurant_name) + price);
        } else {
            restaurantSalesMap.set(restaurant_name, price);
        }
    });

    let highestSales = 0;
    let highestSellingRestaurant = '';

    restaurantSalesMap.forEach((totalSales, restaurantName) => {
        if (totalSales > highestSales) {
            highestSales = totalSales;
            highestSellingRestaurant = restaurantName;
        }
    });

    console.log('Highest sales Restaurant',highestSales, highestSellingRestaurant);
}

/**
 * Identify restaurants which did not sell yet
 * 
 */
function getUnSoldRestaurant() {
    const orders = ordersData;
    const restaurantInfo = restaurantsData;

    const soldRestaurantNames = new Set(orders.map(order => order.restaurant_name.toUpperCase()));
    const unsoldRestaurants = restaurantInfo.filter(restaurant => !soldRestaurantNames.has(restaurant.name.toUpperCase()));
    console.log(unsoldRestaurants);
    const unsoldRestaurantNames = unsoldRestaurants.map(restaurant => restaurant.name);
    console.log("Restaurants that did not make any sales:" ,unsoldRestaurantNames);
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

    console.log(foodMap.values());
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
    console.log(usersWithFoodAndBeverage);
    console.log(`Number of users who ordered both food and beverage: ${numberOfUsers}`);
}

/**
 * Given any restaurant name & item name identify how many sold
 */
function getSoldQuantityInfo() {
    const orders = ordersData;
    const restaurantName = prompt('Please enter the restaurant name'); //Honest John Pizza
    const itemName = prompt('Please enter the food item name'); //cheese pizza

    const totalSold = orders.reduce((total, order) => {
        if (order.restaurant_name === restaurantName && order.item === itemName) {
            total += order.quantity;
        }
        return total;
    }, 0);

    console.log(`Total ${itemName} sold at ${restaurantName}: ${totalSold}`);
}

/**
 * Which all restaurants serve given beverage or food
 */
function getRestaurantInfo() {
    const restaurantData = restaurantsData;
    const itemToFind = prompt('Please enter the beverage/food item name'); 

    const restaurantsServingItem = restaurantData
        .filter(restaurant => restaurant.food.includes(itemToFind) || restaurant.beverages.includes(itemToFind))
        .map(restaurant => restaurant.name);

    console.log(`Restaurants serving ${itemToFind}:`);
    console.log(restaurantsServingItem);
}

/**
 * Sort orders by date
 */
function sortOrdersByDate() {
    const userInput = prompt('Do you want to sort in ASC/DESC?');

    const orders = ordersData;
    const ordersWithUpdatedDate = orders.map(obj => {
        return {...obj, date: new Date(obj.date)};
    });

    if(userInput === 'ASC'){
       const sortedAscOrders = ordersWithUpdatedDate.sort(
            (objA, objB) => Number(objA.date) - Number(objB.date),
        );
        const orderMap = new Map(sortedAscOrders.map((obj, index) => [obj.id, index]));
        console.log('Sorted Orders in Ascending', orders.sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id)));
    } else if (userInput === 'DESC') {
        const sortedDescOrders = ordersWithUpdatedDate.sort(
            (objA, objB) => Number(objB.date) - Number(objA.date),
        );
        const orderMap = new Map(sortedDescOrders.map((obj, index) => [obj.id, index]));
        console.log('Sorted Orders in Descending', orders.sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id)));
    }
    
}

function getUniqueUserIds() {

    const orders = ordersData;
    const uniqueUserIds = new Set();

    for (const order of orders) {
        if (order.item && order.drink) {
            console.log('swe', order);
            if (order.item === order.drink) {
                // console.log('swe order and', order);
                uniqueUserIds.add(order.userId);
            }
       //TODO::
    }

    // Convert the set to an array
    const uniqueUserIdsArray = Array.from(uniqueUserIds);
    console.log('swe uniqueUserIdsArray', uniqueUserIdsArray);
}

}



document.getElementById("1").addEventListener("click", getMaxItemSoldDay);
document.getElementById("2").addEventListener("click", getUniqueUserIds);
document.getElementById("3").addEventListener("click", getHighSaleRestaurant);
document.getElementById("4").addEventListener("click", getUnSoldRestaurant);
document.getElementById("5").addEventListener("click", getRestaurantWithSameItems);
document.getElementById("6").addEventListener("click", getUsersWithFoodAndBeverage);
document.getElementById("7").addEventListener("click", getSoldQuantityInfo);
document.getElementById("8").addEventListener("click", getRestaurantInfo);
document.getElementById("9").addEventListener("click", sortOrdersByDate);
