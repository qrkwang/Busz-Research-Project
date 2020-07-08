import mpu
import csv
from datetime import datetime, timedelta
from array import *
import calendar

    
fieldnames = ['index','time_start', 'time_end']

with open('time_frame.csv' , mode='a+' ,newline='') as csv_output:
    writer = csv.writer(csv_output)
    writer.writerow(fieldnames)
    

FMT = '%I:%M:%S %p' # Format for time
time_dict = dict()

valid = False
count = 0

while valid is False:
    if count is 0 :   
        temp_start_hour = datetime.strptime('12:00:00 AM' , FMT)
    else:
        temp_start_hour = datetime.strptime(time_frame[count - 1][2], FMT)
        
    end_hour = (temp_start_hour + timedelta(minutes = 10)).strftime(FMT)
    start_hour = temp_start_hour.strftime(FMT)
    time_frame = {count : {1: start_hour, 2: end_hour}}
    time_dict.update(time_frame)
    
    if end_hour == '12:00:00 AM':
        valid = True
    else:
        count += 1


for k in time_dict:
    output = {'index' : k, 'time_start': time_dict[k][1] , 'time_end': time_dict[k][2]}
  
    with open('time_frame.csv' , mode='a+' ,newline='') as csv_output:
        writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
        writer.writerow(output)

print("Complete")