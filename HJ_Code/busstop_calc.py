import calendar
import csv
import json
from array import *
from datetime import datetime, timedelta

import googlemaps
import mpu
import requests
from geopy.distance import geodesic

#initialize googlemaps with API Key
# gmaps = googlemaps.Client(key='AIzaSyCviITurPSjJLUxriM7WjfD5dHs4ZltNYQ')

#URL to get the distance between two gps points along the polyline defined for the bus route
URL = "https://laravelsyd-fypfinalver.herokuapp.com/testgetKM"

bus_route_1_distance = dict()
bus_route_2_distance = dict()


with open('dataset/bus_stop_distance_7_route_1.csv', mode='U', encoding='utf-8-sig') as csv_file:
    csv_reader =  csv_reader = csv.DictReader(csv_file)
    count = 0
    for row in csv_reader:
        data = {count : row}
        bus_route_1_distance.update(data)
        count += 1
        
with open('dataset/bus_stop_distance_7_route_2.csv', mode='U', encoding='utf-8-sig') as csv_file:
    csv_reader =  csv_reader = csv.DictReader(csv_file)
    count = 0
    for row in csv_reader:
        data = {count : row}
        bus_route_2_distance.update(data)
        count += 1
        
with open('output/test-output-sample_2.csv' , mode='r' ,newline='') as input ,  open('output/test-output-sample_2_bus.csv', 'w', newline='') as output:
    csv_reader = csv.DictReader(input)
    fieldnames = csv_reader.fieldnames +  ['Distance'] +  ['Bus_Distance'] + ["Speed"] + ["Actual_Duration"]  # add column name to beginning
    csvwriter = csv.DictWriter(output, fieldnames)
    csvwriter.writeheader()
    
    for row in csv_reader:
        if int(row['Route']) is 1:
            route_distance_dic = bus_route_1_distance
        elif  int(row['Route']) is 2:
            route_distance_dic = bus_route_2_distance
            
        distance = 0.0
        # Find the key of the stop
        stop_1 = -1
        stop_2 = -1
           
        # Loop to find the key
        for k,v in route_distance_dic.items():
            if row['BS_A'] == v['Stop1']:
                stop_1 = k
            if row['BS_B'] == v['Stop2']:
                stop_2 = k
            
            # Stop looping when both key is found 
            if stop_1 != -1 and stop_2 != -1:
                break
        
        if stop_1 == stop_2:
            # Take the end of the end of the bus route distance
            bus_distance = bus_route_1_distance[stop_2]['Distance']
        else:
            # Initilize the first stop
            bus_distance =  float(bus_route_1_distance[stop_1]['Distance'])
            temp_stop = stop_1
            #Contiune to travel to the other stop
            while temp_stop != stop_2:
                temp_stop += 1
                bus_distance += float(bus_route_1_distance[temp_stop]['Distance'])
            # print('Bus A' ,row['BS_A'], 'Bus B ',row['BS_B'], 'Distance', distance )
        
        coordinate1 = row['Lat_A'] + ',' + row['Lng_A']
        coordinate2 = row['Lat_B'] + ',' + row['Lng_B']
        #parameters to pass the the Web URL
        my_dictionary = {'busserviceno':7, 'routeno':row['Route'], 'arg1':coordinate1, 'arg2':coordinate2}
        
        r = requests.post(URL,  my_dictionary) 
        #Obtain the output encoded in JSON (array)
        data = r.json()
        speed = 0.0
        actual_duration = 0.0
        
        if str(data) != '[]':
            data = data[0]
            
            #Calculate speed
            speed = float(data) / float(row["Duration(h)"])
            print(speed)
            
            #Calculate Actual Duration
            actual_duration = float(bus_distance) / float(speed) 
            print(actual_duration)
        
        #Cacluate the Duration
        
        #print the data
        csvwriter.writerow(dict(row, Distance= data ,  Bus_Distance= bus_distance, Speed = speed, Actual_Duration = actual_duration ))


print("Completed")
