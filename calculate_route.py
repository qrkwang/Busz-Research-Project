import calendar
import csv
import json
import os.path
from array import *
from datetime import datetime, timedelta
from os import path

import googlemaps
import mpu
import requests

route_1 = '1.662585, 103.598608'
route_2 = '1.463400, 103.764932'

data = dict()
previous = {'route_1' : 0.0 , 'route_2' : 0.0}

fieldnames =  ['Vehicle_No',
            'Date',
            'Time',
            'Location', 
            'Lat', 'Lng' ,
            'Speed',
            'Vehicle_Status',
            'GPS' , 
            'Distance-KM',
            'Vehicle_Batt.-V',
            'Route' ,
            'route_1' ,
            'route_2',
            'route_num'
            ]
new_file_location = "test4.csv"

try:
    #URL to get the distance between two gps points along the polyline defined for the bus route
    URL = "https://laravelsyd-fypfinalver.herokuapp.com/testCal"

    with open('dataset/output-BJA8742_Sample.csv' , mode='r' ,newline='') as input:
                
        with open(new_file_location, mode='a+', newline='') as csv_output:                 
            writer = csv.writer(csv_output)
            writer.writerow(fieldnames)
            
        csv_reader = csv.DictReader(input)
        
        count = 2
        key = 0
        current_num = 0
        
        for row in csv_reader:
            coordinate1 = row['Lat'] + ',' + row['Lng']
            
            my_dictionary = {'latlong1' : coordinate1, 'latlong2' : route_1}
            r_1 = requests.post(URL,  my_dictionary)
            data_1 = r_1.json()

            my_dictionary = {'latlong1' : coordinate1, 'latlong2' : route_2}
            r_2 = requests.post(URL,  my_dictionary)
            data_2 = r_2.json()
             
            new_data = {key : {'Vehicle_No': row["Vehicle_No"], 
                            'Date' : row['Date'] ,
                            'Time': row['Time'],
                            'Location' : row['Location'], 
                            'Lat' : row["Lat"], 'Lng' : row["Lng"],
                            'Speed': row['Speed'],
                            'Vehicle_Status' : row['Vehicle_Status'],
                            'GPS':row['GPS'] , 
                            'Distance-KM': row['Distance-KM'] ,
                            'Vehicle_Batt.-V': row['Vehicle_Batt.-V'],
                            'Route' :  row['Route'],
                            'route_1' : data_1,
                            'route_2' : data_2,
                            'route_num' :  current_num
                            }}
            data.update(new_data)
       
            print("data_1" ,float(data_1) , "route_1" , float(previous['route_1']))
            if key != 0:
                print(current_num)
                if current_num == 0 :
                #Start from route 1
                    if float(previous['route_1']) < 0.05:
                        if float(data_1) > 0.05 : 
                            data[key]["route_num"] = 1
                            data[key-1]["route_num"] = 1
                            current_num = 1
                            print(data[key-1]["route_num"])
                        
                    elif float(previous['route_2']) < 0.05:
                        if float(data_2) > 0.05 :
                            data[key]["route_num"] = 2
                            data[key-1]["route_num"] = 2
                            print("2")
                            current_num = 2
                        
                elif current_num == 1 :
                    if float(data_2) < 0.06 :
                        current_num = 0
                    
                elif current_num == 2 :
                    if float(data_1) < 0.06 :
                        current_num = 0
            
            previous['route_1'] = data_1
            previous['route_2'] = data_2
            
            key = key + 1
            count = count + 1
            print(count)
            
            if count == 50:
                
                for k in data :
                    output = {'Vehicle_No': data[k]["Vehicle_No"], 
                            'Date' : data[k]['Date'] ,
                            'Time': data[k]['Time'],
                            'Location' : data[k]['Location'], 
                            'Lat' : data[k]["Lat"], 'Lng' : data[k]["Lng"],
                            'Speed': data[k]['Speed'],
                            'Vehicle_Status' : data[k]['Vehicle_Status'],
                            'GPS': data[k]['GPS'] , 
                            'Distance-KM': data[k]['Distance-KM'] ,
                            'Vehicle_Batt.-V': data[k]['Vehicle_Batt.-V'],
                            'Route' :  data[k]['Route'],
                            'route_1' : data[k]['route_1'],
                            'route_2' : data[k]['route_2'],
                            'route_num' :  data[k]['route_num']
                            }
   
                    #Save to file location
                    with open(new_file_location , mode='a' ,newline='') as csv_output:
                        writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
                        writer.writerow(output)
                break

except KeyboardInterrupt:
    print("Exiting...")
