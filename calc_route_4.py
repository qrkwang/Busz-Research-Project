# -*- coding: utf-8 -*-
"""calc_route-2.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1Cf8dr5JPvt78DQ0qmJQeurt6Lc-62POb
"""

import pandas as pd # Import the pandas library
import requests # Import the requests library
import numpy as np

# Declare variables
URL = "https://laravelsyd-fypfinalver.herokuapp.com/testCal"
route_1 = "1.662585, 103.598608"
route_2 = "1.463400, 103.764932"

# Load test data
# df = pd.read_csv('output-BJA8742_Sample_1.csv')
df = pd.read_csv('dataset/output-BJA8742.csv')

print(df.shape)
print(df.head())

# Reset route_1, route_2 and route_num
df['route_num'] = 0
# df['route_1'] = 0.0
# df['route_2'] = 0.0

print(df.head())

# Calculate and update route_1 and route_2
def getDictionary(coords, route):
  return {"latlong1": coords, "latlong2": route}

status = 0
direction = 0
arr_index = 0

# Print Columns
# print("CR",'\t', "route_num" , '\t' "Index", '\t' ,"Status", '\t',"Direction" , '\t' ,"route_1", '\t' ,"route_2" )

print("Index",'\t', "direction",'\t',"R_Nu",'\t\t', "C_Row" , '\t', "P_Row" )

# Return the cooridnate dict
def poly_Dictionary(bus_service, first_point, last_point):
  return {"bus_service": bus_service, "first_point": first_point, "last_point": last_point}

# Determine if on the polyline
def check_poly(first_point, last_point):
  checkURL = "https://laravelsyd-fypfinalver.herokuapp.com/determineRoute"
  return requests.post(checkURL,  poly_Dictionary("7",first_point, last_point )).json()

arr = np.zeros(shape=(10,3))
distance = np.zeros(shape=(10,2))
# Determine the status based on coords
data_index = {"dir_key" : 0, "index_key" : 0  ,"reset_key" : 0 }

for index, row in df.iterrows():
  latlng = str(row['Lat'])+','+str(row['Lng'])
  df.at[index, 'route_1'] = requests.post(URL, getDictionary(latlng, route_1)).json()
  df.at[index, 'route_2'] = requests.post(URL, getDictionary(latlng, route_2)).json()
  
  if index == 500:
    break


for index, row in df.iterrows():
  latlng = str(row['Lat'])+','+str(row['Lng'])
  
  current_row = str(row['Lat']) + ',' + str(row['Lng'])

  nextRow = df.iloc[index+1]
  next_row = str(nextRow.at['Lat']) + ',' + str(nextRow.at['Lng'])
  
  latlng = str(row['Lat']) + ',' + str(row['Lng'])
  
  if arr_index == 10:
    arr_index = 0

    min_route_1 = np.argmin(distance[:,[0]])
    min_route_2 = np.argmin(distance[:,[1]])
    
    if data_index["dir_key"] == 0 :
      if float(df.at[index, 'route_1']) < float(df.at[index, 'route_2']) and arr[min_route_1][1] != -1 :
        data_index["index_key"] = int(arr[min_route_1][0])
        data_index["dir_key"] = 1
      elif float(df.at[index, 'route_2']) < float(df.at[index, 'route_1']) and arr[min_route_2][1] != -1 :
        data_index["index_key"] = int(arr[min_route_2][0])
        data_index["dir_key"] = 2
    else:
      # if float(row["route_1"]) < 0.06 or float(row["route_2"]) < 0.06:
      if float(distance[min_route_1][0]) < 0.06 :
        data_index["index_key"] = int(arr[min_route_1][0]) + 1
        data_index["dir_key"] = 0

      elif float(distance[min_route_2][1]) < 0.06:
        data_index["index_key"] = int(arr[min_route_2][0]) + 1
        data_index["dir_key"] = 0
        
      else:
        data_index["index_key"] = -1

    print(data_index)
    
    k = 0
    for row in arr:
      if row[0] == data_index["index_key"] :  
        df.at[row[0], 'route_num'] = data_index["dir_key"]
        data_index["reset_key"] = data_index["dir_key"]
      else:
        df.at[row[0], 'route_num'] = data_index["reset_key"]
        print(df.at[index, 'route_num'] )
        
      print(row)
      k = k + 1
      
  else:
    arr[arr_index] = [index, check_poly(current_row, next_row)["route_id"], row["Route"]]
    distance[arr_index] = [row["route_1"], row["route_2"]]
    arr_index = arr_index + 1
 
  if index > 500:
    df.to_csv(r'test4.csv', index = False)
    break
      

  # if check_poly(current_row, next_row)["route_id"] == -1 and direction == 0:
  #   direction = 0
  # else:
  #   if direction == 0:
  #     direction = check_poly(current_row, next_row)["route_id"]
  #   elif direction == 1:
  #      if float(row['route_2']) < 0.06 :
  #         direction = 0
  #   elif direction == 2:
  #       if float(row['route_1']) < 0.06 :
  #         direction = 0


  # print(index, '\t', direction, '\t' ,row["Route"], '\t', df.at[index, 'route_1'], '\t',df.at[index, 'route_2'])

  # Update the route_num
  # df.at[index, 'route_num'] = direction
  # print(row['Route'],'\t\t', row['route_num'], '\t' , index, ":", '\t' ,getStatus(status)+'({0})'.format(status), '\t',getDirection(direction) , '\t\t' ,round(row['route_1'],2), '\t\t' ,round(row['route_2'],2))

# Save df to csv
# df.to_csv(r'test6.csv', index = False)