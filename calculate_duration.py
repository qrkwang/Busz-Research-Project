import calendar
import csv
import os.path
from array import *
from datetime import datetime, timedelta
from os import path

import mpu

route_1 = dict()
route_2 = dict()

#Storing the order into route
with open('dataset/route_bus_stop.csv', mode='U', newline='') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        if int(row["route_id"]) is 1:
            bus_stop = row["bus_stop_id"] 
            route_order = row["route_order"]
            new_data = {bus_stop: route_order} #Key => bus stop , Value => route order
            route_1.update(new_data)
            
        elif int(row["route_id"]) is 2:
            bus_stop = row["bus_stop_id"] 
            route_order = row["route_order"]
            new_data = {bus_stop: route_order} #Key => bus stop , Value => route order
            route_2.update(new_data)
            

def calculate_duration(file_dataset, new_file_location):
    bus_data = dict()

    with open(file_dataset, mode='U', newline='') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        line_count = 0 
        key = 0
        bus_row = {1: '' , 'route_order' : 0 , 'route': 0}
        
        #Append the header first 
        fieldnames = ['Date', 
                        'Day', 
                        'Time_A',
                        'BS_A', 
                        'Lat_A' , 'Lng_A',  
                        'Time_B' , 
                        'BS_B', 
                        'Lat_B', 'Lng_B', 
                        'Duration(h)', 
                        'Route']
        
        with open(new_file_location, mode='a+', newline='') as csv_output:                 
            writer = csv.writer(csv_output)
            writer.writerow(fieldnames)
        
        
        for row in csv_reader:        
            FMT = '%I:%M:%S %p' # Format for time
            date = datetime.strptime(row["Date"], "%d/%m/%Y")    #Convert to date object
            day =  calendar.day_name[date.weekday()]   #Get the day from the calendar
            time = row["Time"]
            
            #Get the route number and define it
            if int(row["Route"]) is 1:
                route_num = route_1
            elif int(row["Route"]) is 2:
                route_num = route_2

            #Store the first value
            if line_count is 0:
                nearest_stop = row["Nearest_Stop"]
                route_order = int(route_num[nearest_stop]) #Get the current key value route order

                #Assign the route_order, route to use
                bus_row[1] = row
                bus_row['route_order'] = route_order
                bus_row['route'] = row["Route"]

            else:                 
                nearest_stop = row["Nearest_Stop"]
                route_order = int(route_num[nearest_stop]) #Get the current key value route order
            
                if bus_row['route'] != row['Route']:
                    #Assign the route_order, route to use
                    bus_row[1] = row
                    bus_row['route_order'] = route_order
                    bus_row['route'] = row["Route"]
                    
                
                elif bus_row['route_order'] == route_order:
                    #Time difference if there is a jam
                    tdelta = datetime.strptime( row["Time"] , FMT) - datetime.strptime(bus_row[1]["Time"], FMT)
                    if bool(bus_data):
                        #Get the previous data key and update the time
                        bus_data[key - 1]['duration'] += tdelta.seconds
                        bus_data[key - 1]['Lat_B'] = row['Lat']
                        bus_data[key - 1]['Lng_B'] = row['Lng']
                        bus_data[key - 1]['time_B'] = row['Time']
                        bus_row[1] = row
                    

                elif int(bus_row['route_order']) < route_order :
                    #Replace the route_order. Should be going in ascending 
                    bus_row['route_order'] = route_order
                    tdelta = datetime.strptime( row["Time"] , FMT) - datetime.strptime(bus_row[1]["Time"], FMT)
                    
                    print(row["Time"])

                    #(Lat, Lng)
                    BS_A_coordinates = (bus_row[1]["Lat"], bus_row[1]["Lng"]) 
                    BS_B_coordinates = (row['Lat'] , row['Lng'])
                    
                    #Save in time seconds
                    new_data = {key : {'date': row["Date"], 
                                    'day' : day ,
                                    'time_A': bus_row[1]['Time'],
                                    'BS_A' : bus_row[1]["Nearest_Stop"], 
                                    'Lat_A' : bus_row[1]["Lat"], 'Lng_A' :  bus_row[1]["Lng"],
                                    'time_B': row['Time'],
                                    'BS_B' : row["Nearest_Stop"], 
                                    'Lat_B':row['Lat'] , 'Lng_B': row['Lng'] ,
                                    'duration': tdelta.seconds,
                                    'route' :  row['Route']
                                    }}
                    
                    bus_data.update(new_data)
                    
                    #After updating...add the new row and key increment by 1
                    bus_row[1] = row
                    key += 1           
                    
            #print(bus_data)
            line_count += 1 

    for k in bus_data:
        # store the processed data back to the file
        output = {'Date': bus_data[k]["date"],
                'Day': bus_data[k]["day"],
                'Time_A': bus_data[k]['time_A'],
                'BS_A': bus_data[k]["BS_A"],
                'Lat_A': bus_data[k]["Lat_A"], 'Lng_A': bus_data[k]["Lng_A"],
                'Time_B': bus_data[k]['time_B'],
                'BS_B': bus_data[k]["BS_B"],
                'Lat_B': bus_data[k]['Lat_B'] , 'Lng_B': bus_data[k]['Lng_B'],
                'Duration(h)': bus_data[k]["duration"] /3600,  # Convert to hours
                'Route': bus_data[k]['route']
                }
        
        fieldnames = ['Date', 
                    'Day', 
                    'Time_A',
                    'BS_A', 
                    'Lat_A' , 'Lng_A',  
                    'Time_B' , 
                    'BS_B', 
                    'Lat_B', 'Lng_B', 
                    'Duration(h)', 
                    'Route']
        
        #Save to file location
        with open(new_file_location , mode='a' ,newline='') as csv_output:
            writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
            writer.writerow(output)

            # print("data point in csv", route, lat1, lon1)
    print("Successfully completed")

file_dataset = input("Enter the location of dataset to clean : ") # Location of dataset to clean

if path.exists(file_dataset) is True:
    file_name = input("Save file as (include .csv) : ") # Save file location
    new_file_location = 'output/' + file_name
    calculate_duration(file_dataset, new_file_location)
else:
    print("The file doesn't exisit")
    
