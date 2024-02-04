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
        console.log('swe', obj);
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

    // console.log("Max Items sold date : ",maxDayDetail);

    if(APP_CONSTANTS.WEEK_DAYS.find(item => item === maxDay.toUpperCase())){
        // console.log('WEEKDAY');
    }else{
        // console.log('WEEKEND-DAY');
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


getMaxItemSoldDay();
getHighSaleRestaurant();