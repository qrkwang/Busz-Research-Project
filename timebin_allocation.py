import calendar
import csv
import os.path
from array import *
from datetime import datetime, timedelta


time_frame = dict()
FMT = '%I:%M:%S %p' # Format for time
FMT_24 = '%H:%M:%S'

def time_in_range(start, end, x):
    #Return true if x is in the range [start, end]
    if start <= end:
        return start <= x <= end
    else:
        return start <= x or x <= end

with open('dataset/time_frame.csv', mode='U', encoding='utf-8-sig') as csv_file:
    csv_reader =  csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        data = {row['index'] : [row['time_start'], row['time_end']]}
        time_frame.update(data)

with open('output/test-output-2.csv' , mode='r' ,newline='') as input ,  open('output/data.csv', 'w', newline='') as output:
    csv_reader = csv.DictReader(input)
    fieldnames = csv_reader.fieldnames +  ['time_bin']  + ['time_range']# add column name to beginning
    csvwriter = csv.DictWriter(output, fieldnames)
    csvwriter.writeheader()
    
    count = 0
    #Store the allocated time bin
    time_bin = dict()
        
    for row in csv_reader:
        
        dt_departure_time = datetime.strptime(row['Time_A'], FMT) # Change in to a datetime object
        deperature_time = dt_departure_time.strftime(FMT_24) # Convert into time

        for k in time_frame:
            dt_time_start = datetime.strptime(time_frame[k][0], FMT)
            dt_time_end = datetime.strptime(time_frame[k][1], FMT)
            
            time_start = dt_time_start.strftime(FMT_24)
            time_end = dt_time_end.strftime(FMT_24)
            
            if time_in_range(time_start, time_end, deperature_time) is True: 
                time_range = time_frame[k][0] + '-' + time_frame[k][1]
                csvwriter.writerow(dict(row, time_bin = k, time_range =  time_range))
                break
    
        #print the data


    
# if path.exists(file_dataset) is True:
#     file_name = input("Save file as (include .csv) : ") # Save file location
#     new_file_location = 'output/' + file_name
#     calculate_nearestBS(file_dataset, new_file_location)
# else:
#     print("The file doesn't exisit")
print("Completed")
