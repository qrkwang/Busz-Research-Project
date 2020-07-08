import csv
import json
import googlemaps
import collections
from datetime import datetime

#declare output dictionary to be written
#output = collections.defaultdict(

def readInput():
	file_dataset = input("Enter the location of dataset to clean : ") # Location of dataset to clean
	file_name = input("Save file as (include .csv) : ") # Save file location

	new_file_location = 'output/' + file_name

	#read input file -- gps traces obtained from the bus operator
	with open(file_dataset, mode='U') as csv_file:
		csv_reader = csv.DictReader(csv_file)
		line_count = 0
		for row in csv_reader:
					
			#with the location data, call google api to get the lat, lng
			geocode_result = gmaps.geocode(row["Location"])
			#parse the result
			geometry_dict = json.loads(json.dumps(geocode_result[0]))
			location_dict = geometry_dict['geometry']
			coordinate_dict = location_dict['location']
				
			#store inside the dictionary to be written
			output = {'Vehicle_No':row["Vehicle_No"], 'Date':row["Date"], 'Time':row["Time"], 'Location':row["Location"], 'Lat':coordinate_dict['lat'], 'Lng':coordinate_dict['lng'], 'Speed':row["Speed"], 'Vehicle_Status':row["Vehicle_Status"], 'GPS':row["GPS"], 'Distance-KM':row["Distance-KM"], 'Vehicle_Batt.-V':row["Vehicle_Batt.-V"]}
			print(output)
			fieldnames = ['Vehicle_No', 'Date', 'Time', 'Location', 'Lat', 'Lng', 'Speed', 'Vehicle_Status', 'GPS', 'Distance-KM', 'Vehicle_Batt.-V']
			
			#write output
			with open(new_file_location, mode='a+') as csv_output:
				writer = csv.DictWriter(csv_output, fieldnames = fieldnames)
				writer.writerow(output)
			line_count += 1

		print('Completed successfully')

#initialize googlemaps with API Key
# Uncomment this to use the function
# gmaps = googlemaps.Client(key='AIzaSyCJJW14Y8UPhaxeiwWq8gpQvA6k3CihX2M')
if 'gmaps' not in locals():
    print("Need googlemaps client api key!")
else:
    readInput()