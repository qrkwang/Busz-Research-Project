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

#URL to get the distance between two gps points along the polyline defined for the bus route
URL = "https://laravelsyd-fypfinalver.herokuapp.com/testCal"

with open('dataset/output-BJA8742.csv' , mode='r' ,newline='') as input ,  open('test.csv', 'w', newline='') as output:
    csv_reader = csv.DictReader(input)
    fieldnames = csv_reader.fieldnames +  ['route_1'] + ['route_2']
    
    csvwriter = csv.DictWriter(output, fieldnames)
    csvwriter.writeheader()


    for row in csv_reader:
        coordinate1 = row['Lat'] + ',' + row['Lng']
            
        my_dictionary = {'latlong1' : coordinate1, 'latlong2' : route_1}
        r_1 = requests.post(URL,  my_dictionary)
        data_1 = r_1.json()

        my_dictionary = {'latlong1' : coordinate1, 'latlong2' : route_2}
        r_2 = requests.post(URL,  my_dictionary)
        data_2 = r_2.json()
        
        csvwriter.writerow(dict(row, route_1 = data_1, route_2 = data_2))
