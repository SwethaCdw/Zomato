import {ordersData, restaurantsData, userData} from '../services/zomato-services.js';
import { APP_CONSTANTS } from '../constants/app-constants.js';

//Identify which day more items are sold
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

    // console.log("Max Items sold date : ",maxDayDetail);
        if(APP_CONSTANTS.WEEK_DAYS.find(item => item === maxDay.toUpperCase())){
            orders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.getDay() >= 1 && orderDate.getDay() <= 5) {
                    weekdaySale += order.price * order.quantity;
                }
            });
            console.log('WEEKDAY SALE: ', weekdaySale);
        }else{
            orders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.getDay() >= 6 && orderDate.getDay() <= 7) {
                    weekendSale += order.price * order.quantity;
                }
            });
            console.log('WEEKEND SALE: ', weekendSale);
        }
}

//Identify restaurant which did sell highest
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

    // console.log(highestSales, highestSellingRestaurant);
}


function getUnSoldRestaurant() {
    const orders = ordersData;
    const restaurantInfo = restaurantsData;

    const soldRestaurantNames = new Set(orders.map(order => order.restaurant_name.toUpperCase()));
    const unsoldRestaurants = restaurantInfo.filter(restaurant => !soldRestaurantNames.has(restaurant.name.toUpperCase()));
    console.log(unsoldRestaurants);
    const unsoldRestaurantNames = unsoldRestaurants.map(restaurant => restaurant.name);
    console.log("Restaurants that did not make any sales:" ,unsoldRestaurantNames);
}

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
    } else {
        const sortedDescOrders = ordersWithUpdatedDate.sort(
            (objA, objB) => Number(objB.date) - Number(objA.date),
        );
        const orderMap = new Map(sortedDescOrders.map((obj, index) => [obj.id, index]));
        console.log('Sorted Orders in Descending', orders.sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id)));
    }
    
}