<h1>#MyBusz Project</h1>

<h2>Order to execute</h2>
1) <b>readInput.py</b> 
    <br>To calculate the geolocation of the address returning us the lat and lon

2) <b>retrieve_NearestBS.py</b>
    <br>To find the nearest busstop of each location

3) <b>calculate_duration.py</b>
    <br>To calculate the duration of the bus travelling from one point to the other point

4) <b>calculate_actual_duration.py</b>
    To calcualte the actual duration of the bus travelling time
    Factor that have been calculated
        <br>- Finding the distance between 2 point using the testKM API
        <br>- Finding the speed of the point using distance/duration
        <br>- Finding the actual distance of the actual busstop location
        <br>- Finding the actual duration taken using the "actual_distance / speed"