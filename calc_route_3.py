# -*- coding: utf-8 -*-
"""calc_route-2.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1Cf8dr5JPvt78DQ0qmJQeurt6Lc-62POb
"""

import pandas as pd # Import the pandas library
import requests # Import the requests library

# Declare variables
URL = "https://laravelsyd-fypfinalver.herokuapp.com/testCal"
route_1 = "1.662585, 103.598608"
route_2 = "1.463400, 103.764932"

# Load test data
df = pd.read_csv('dataset/output-BJA8742_Sample.csv')

print(df.shape)
print(df.head())

# Reset route_1, route_2 and route_num
df['route_num'] = 0
df['route_1'] = 0.0
df['route_2'] = 0.0

print(df.head())

# Calculate and update route_1 and route_2
def getDictionary(coords, route):
  return {"latlong1": coords, "latlong2": route}

for index, row in df.iterrows():
  latlng = str(row['Lat'])+','+str(row['Lng'])

  df.at[index, 'route_1'] = requests.post(URL, getDictionary(latlng, route_1)).json()
  df.at[index, 'route_2'] = requests.post(URL, getDictionary(latlng, route_2)).json()


print(df.head())

status = 0
direction = 0

# Print Columns
# print("CR",'\t', "route_num" , '\t' "Index", '\t' ,"Status", '\t',"Direction" , '\t' ,"route_1", '\t' ,"route_2" )

print("C",'\t', "N" , '\t' "Route" )

# Gets status int and returns string
def getStatus(i):
  if i is 1:
    return "start"
  elif i is 2:
    return "moving"
  elif i is 3:
    return "end"
  else:
    return "idle"

# Gets direction int and returns string
def getDirection(i):
  if i is 0:
    return "|"
  elif i is 1:
    return ">"
  else:
    return "<"

# Return the cooridnate dict
def poly_Dictionary(bus_service, first_point, last_point):
  return {"bus_service": bus_service, "first_point": first_point, "last_point": last_point}

# Determine if on the polyline
def check_poly(first_point, last_point):
  checkURL = "https://laravelsyd-fypfinalver.herokuapp.com/determineRoute"
  # print( poly_Dictionary("7",first_point, last_point ))
  print(poly_Dictionary("7",first_point, last_point ))
  return requests.post(checkURL,  poly_Dictionary("7",first_point, last_point )).json()

# Determine the status based on coords
for index, row in df.iterrows():
  current_row = str(row['Lat']) + ',' + str(row['Lng'])

  nextRow = df.iloc[index+1]
  next_row = str(nextRow.at['Lat']) + ',' + str(nextRow.at['Lng'])

  # if status == 1:
  #   status = 2
  # elif status == 3:
  #   direction = 0
  #   status = 0

  # Select the next row index
  # if (float(row['route_1']) < 0.05 or float(row['route_2']) < 0.05) and status == 0:
  #   nextRow = df.iloc[index+1]
  #   if (float(nextRow.at['route_1']) >= 0.05 and float(nextRow.at['route_2']) >= 0.05):
  #     status = 1
  #     if row['route_1'] > row['route_2']:
  #       direction = 2
  #     else:
  #       direction = 1
  # elif (float(row['route_1']) < 0.06 or float(row['route_2']) < 0.06) and status == 2:
  #   status = 3

  # Update the route_num
  df.at[index, 'route_num'] = check_poly(current_row, next_row)["route_id"]

# Save df to csv
df.to_csv('test5.csv', index = False)