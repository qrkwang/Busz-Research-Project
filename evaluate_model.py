from keras.models import load_model
import sys
import pandas as pd
import math
from sklearn.preprocessing import RobustScaler
import pickle
from sklearn.metrics import mean_squared_error

lstm = False

#Get target csv files
if(len(sys.argv) == 3 or len(sys.argv) == 4):
	if (len(sys.argv) == 4 and sys.argv[1] == '-lstm'):
		path = sys.argv[2]
		# data_path
		data_path = sys.argv[3]
		lstm = True
	else:
	    #csv_file_path stores the raw data
	    path = sys.argv[1]
	    data_path = sys.argv[2]
else:
    print("Usage python evaluate_model.py <Model and Scaler Directory> <Data Path>")
    print("Usage python evaluate_model.py -lstm <Model and Scaler Directory> <Data Path>")

model_path = path + '/model.hdf5'

#Load model
model = load_model(model_path)
# Decrapted
# https://github.com/keras-team/keras/issues/6124
# model._make_predict_function()


#Read data csv file
df = pd.read_csv(data_path)

#Drop unrelevant feature columns
df = df.drop(columns = ['current_time', 'hour', 'minute', 'round'])
df.reset_index()

#Extract Features Columns
input_df = df.drop(columns=['duration'])
print('Evaluation Features')

#Extract Output Features
output_df = df[['duration']]

print(output_df.head())

inputscalerfile = path + '/input_scaler.sav'
outputscalerfile = path + '/output_scaler.sav'

#Get values as float from input data
input_df = input_df.values
input_df = input_df.astype('float32')
output_df = output_df.values
output_df = output_df.astype('float32')

#Load Scaler
print('Loading Scalers...')
scalar_input = pickle.load(open(inputscalerfile, 'rb'))
scalar_output = pickle.load(open(outputscalerfile, 'rb'))

scalar_input.fit(input_df)
input_df = scalar_input.transform(input_df)

scalar_output.fit(output_df)
output_df = scalar_output.transform(output_df)

if(lstm == True):
	input_df = input_df.reshape((input_df.shape[0], 1, input_df.shape[1]))

print('Evaluating Model...')

#Calculate training score
#test_score = model.evaluate(input_df, output_df, verbose=0)

# make a prediction
predicted = model.predict(input_df)


predicted = scalar_output.inverse_transform(predicted)
output_df = scalar_output.inverse_transform(output_df)

mae_sum = 0
mse_sum = 0

# show the inputs and predicted outputs
for i in range(len(predicted)):
	mae_sum += abs(predicted[i] - output_df[i])
	mse_sum += math.pow(abs(predicted[i] - output_df[i]), 2)
	#print("X=%s, Predicted=%s" % (input_df[i], predicted[i]))

mae = mae_sum/len(predicted)
rmse = math.sqrt(mse_sum/len(predicted))

print("MAE: " + str(mae[0]))
print("RMSE: " + str(rmse))
print("MSE: " + str(mean_squared_error(predicted, output_df)))
'''
#Print Results
print('Test Score')
print('----------')
print('MAE: %.2f' % test_score[1])
print('MSE: %.2f' % test_score[0])
print('RMSE: %.2f' % math.sqrt(test_score[0]))
print('----------')
'''