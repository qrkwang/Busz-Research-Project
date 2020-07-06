import mpu
import csv
from datetime import datetime, timedelta
from array import *
import calendar

route_1 = dict()
route_2 = dict()
time_frame = dict()
bus_data = dict()

#Storing the order into route
with open('route_bus_stop.csv', mode='U', newline='') as csv_file:
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

#Storing the order into route
with open('time_frame.csv', mode='U', newline='') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        index = row["index"] 
        time_start = row["time_start"]
        time_end = row["time_end"]
        
        new_data = {index: {1: time_start, 2: time_end}}
        time_frame.update(new_data)
     
newfile = 'test-output-sample_2.csv'

with open('test-output-sample_1.csv', mode='U', newline='') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    line_count = 0 
    key = 0
    bus_row = {1: '' , 'route_order' : 0 , 'route': 0}
    
    #Append the header first
    fieldnames = ['Date', 'Day','BS_A', 'Lat_A' , 'Lng_A' 'BS_B', 'Lat_B', 'Lng_B', 'Time', 'Route']

 
    with open(newfile, mode='a+', newline='') as csv_output:                 
        writer = csv.writer(csv_output)
        writer.writerow(fieldnames)
     
    for row in csv_reader:    
        FMT = '%I:%M:%S %p' # Format for time
        date = datetime.strptime(row["Date"], "%m/%d/%Y")    #Convert to date object
        day =  calendar.day_name[date.weekday()]   #Get the day from the calendar
        time = row["Time"]
        
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
                #Get the previous data key and update the time
                bus_data[key - 1]['time'] += tdelta.seconds
                
            elif int(bus_row['route_order']) < route_order :
                #Replace the route_order. Should be going in ascending 
                bus_row['route_order'] = route_order
                tdelta = datetime.strptime( row["Time"] , FMT) - datetime.strptime(bus_row[1]["Time"], FMT)

                bus_stop_A = bus_row[1]["Nearest_Stop"]
                bus_stop_B = row["Nearest_Stop"]
                bus_row[1] = row
                #print(bus_stop_A, bus_stop_B , tdelta.seconds)
                
                #Save in time seconds
                new_data = {key : {'date': row["Date"], 'day' : day ,'BS_A' : bus_stop_A, 'BS_B' : bus_stop_B, 'time': tdelta.seconds, 'route' :  row['Route'] } }
                bus_data.update(new_data)
                key += 1     
                
        #print(bus_data)
        line_count += 1 


for k in bus_data:
    # store the processed data back to the file
    output = {'Date' :bus_data[k]["date"], 'Day' : bus_data[k]["day"], 'BS_A': bus_data[k]["BS_A"], 'BS_B': bus_data[k]["BS_B"], 'Time': bus_data[k]["time"], 'Route': bus_data[k]['route']}
    fieldnames = ['Date', 'Day','BS_A', 'BS_B', 'Time', 'Route']

    with open(newfile , mode='a+' ,newline='') as csv_output:
        writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
        writer.writerow(output)

		# print("data point in csv", route, lat1, lon1)
print("Successfully completed")
