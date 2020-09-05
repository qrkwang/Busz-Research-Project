<ins>App Description</ins>
Bus drivers are travelling either route 1 or 2. 
They would use the app:
1) To gauge how far is the bus ahead
2) Interact with map for information — Other buses, Bus Stops along the same route
3) App would repeatedly insert location in the backend while bus is moving 
    for other bus drivers to view.

<ins>Features Summary</ins>
Bluetooth Scanning
Permissions API to request for bluetooth and location
Geolocation library to always retrieve current location
Fetching and sending using server API to communicate with DB
Dynamically fill and update React Native UI
Repeatedly call function using setInterval
Interacting with Map, setting of markers and displaying.

<ins>General Flow</ins>
When app is started, at the Homescreen:
1) App will start scanning for beacons and identify the closest few beacons for user to select. 
(Identify your own bus instance)
2) If more than 1 beacon detected, show the detected few. 
    If none detected, show all bus instances for user to select 
     If only 1 detected, show only the one.
3) Once user clicks on bus button or submit using selection picker, app will navigate to second screen.

On the second screen: 
4) Bus instance information will be displayed on the UI (Route, Bus Number, Bus Plate
5) App will repeatedly retrieve all bus locations from DB.  
