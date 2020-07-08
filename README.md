#MyBusz Project

Order to execute
1) readInput.py 
    To calculate the geolocation of the address returning us the lat and lon

2) retrieve_NearestBS.py
    To find the nearest busstop of each location

3) calculate_duration.py
    To calculate the duration of the bus travelling from one point to the other point

4) calculate_actual_duration.py
    To calcualte the actual duration of the bus travelling time
    Factor that have been calculated
        - Finding the distance between 2 point using the testKM API
        - Finding the speed of the point using distance/duration
        - Finding the actual distance of the actual busstop location
        - Finding the actual duration taken using the "actual_distance / speed"