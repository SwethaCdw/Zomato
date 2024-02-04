export const ordersData = await fetch('../resources/orders.json')
.then(response => response.json())
.then(data => {
    return data;
})
.catch(error => console.error('Error reading JSON file:', error));


export const restaurantsData = await fetch('../resources/restaurants.json')
.then(response => response.json())
.then(data => {
    return data;
})
.catch(error => console.error('Error reading JSON file:', error));


export const userData = await fetch('../resources/users.json')
.then(response => response.json())
.then(data => {
    return data;
})
.catch(error => console.error('Error reading JSON file:', error));