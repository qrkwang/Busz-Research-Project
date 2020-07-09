import mpu
import csv
from datetime import datetime, timedelta
from array import *
import calendar

FMT = '%I:%M:%S %p' # Format for time
time_dict = dict()

valid = False
count = 0
start_time = '05:10:00 AM'
minutes_increase = 30


while valid is False:
    if count is 0 :   
        temp_start_hour = datetime.strptime(start_time , FMT)
    else:
        temp_start_hour = datetime.strptime(time_frame[count - 1][2], FMT)
        
    end_hour = (temp_start_hour + timedelta(minutes = minutes_increase)).strftime(FMT)
    start_hour = temp_start_hour.strftime(FMT)
    time_frame = {count : {1: start_hour, 2: end_hour}}
    time_dict.update(time_frame)
    
    if end_hour == start_time:
        valid = True
    else:
        count += 1
    
fieldnames = ['index','time_start', 'time_end']
new_file_location = 'dataset/time_frame.csv'

with open(new_file_location , mode='w' ,newline='') as csv_output:
    writer = csv.writer(csv_output)
    writer.writerow(fieldnames)

for k in time_dict:
    output = {'index' : k, 'time_start': time_dict[k][1] , 'time_end': time_dict[k][2]}
  
    with open(new_file_location , mode='a+' ,newline='') as csv_output:
        writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
        writer.writerow(output)

print("Complete")