import calendar
import csv
import os.path
from array import *
from datetime import datetime, timedelta
from os import path


days = {"Monday" : 0,
        "Tuesday" : 1,
        "Wednesday" : 2,
        "Thursday" : 3,
        "Friday" : 4,
        "Saturday" : 5,
        "Sunday" : 6}

def prep_dataset(file_dataset, new_file_location):
    
    with open(file_dataset , mode='r' ,newline='') as input ,  open(new_file_location, 'w', newline='') as output:
        csv_reader = csv.DictReader(input)
        
        #Append the header first 
        fieldnames = ['bus_stop_code',
                      'current_time',
                      'duration',
                      'hour',
                      'round',
                      'day',
                      'minute',
                      'time']
        
        csvwriter = csv.DictWriter(output, fieldnames)
        csvwriter.writeheader()
        
        for row in csv_reader: 
            for k in days:
                FMT = '%I:%M:%S %p' # Format for time
                tdelta = datetime.strptime( row["Time_A"] , FMT)    #Convert to date object
                time = tdelta.strftime('%H:%M:%S')
                
                #Convert hour to seconds
                duration = int(float(row["Duration(h)"]) * 3600)
                
                #5 digitformat
                bus_stop_A = "{0:0=5d}".format(int(row["BS_A"]))
                bus_stop_B = "{0:0=5d}".format(int(row["BS_B"]))
                # store the processed data back to the file
                output = {'bus_stop_code' : bus_stop_A + bus_stop_B,
                        'current_time': time,
                        'duration': duration,
                        'hour': tdelta.hour,
                        'round': 0,
                        'day': days.get(row["Day"]),
                        'minute': tdelta.minute,
                        'time': row['time_bin'],
                        }

            csvwriter.writerow(output)
    print("Completed")

file_dataset = "output/sample-2-2.csv" # Location of dataset to clean
        
if path.exists(file_dataset) is True:
    # file_name = input("Save file as (include .csv) : ") # Save file location
    file_name = "prep_data-1.csv"
    new_file_location = 'output/' + file_name
    prep_dataset(file_dataset, new_file_location)
else:
    print("The file doesn't exisit")
