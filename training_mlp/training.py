# first neural network with keras tutorial
from numpy import loadtxt
from tensorflow.keras.models import Sequential
from keras.layers import Dense
import matplotlib.pyplot as plt
plt.switch_backend('agg')
import pandas as pd
import sys
import time
import math
import pickle
import os
from sklearn.preprocessing import RobustScaler
from keras.callbacks import ModelCheckpoint
from keras.callbacks import TensorBoard
import tensorflow as tf
from datetime import datetime
from tensorflow import keras
from os import path

def print_evaluation(model, train_score, test_score, start_time):
	#Print Results
	print('Evaluation metrics: ' + str(model.metrics_names))
	print('--------------------')
	print('Train Score')
	print('----------')
	print('MAE: %.2f' % train_score[1])
	print('MSE: %.2f' % train_score[0])
	print('RMSE: %.2f' % math.sqrt(train_score[0]))
	print('----------')
	print('Test Score')
	print('----------')
	print('MAE: %.2f' % test_score[1])
	print('MSE: %.2f' % test_score[0])
	print('RMSE: %.2f' % math.sqrt(test_score[0]))
	print('----------')
	print('Time Elapsed: ' + str(time.time() - start_time) + " seconds.")

#Create model first
def create_model(n_cols):
	# Declare model
	model = Sequential()
 
	#Add Layers
	model.add(Dense(20,	 activation='relu', input_shape=(n_cols,)))
	model.add(Dense(100, activation='relu'))
	model.add(Dense(200, activation='relu'))

	model.add(Dense(1, activation='relu'))
 
	return model

def train_data(file_dataset, bus_service, model_path):
	#Load the dataset
	train_df = pd.read_csv(file_dataset)
	train_df = train_df.drop(columns = ['current_time', 'hour', 'minute', 'round'])
	#Reset the index, [bus_stop, duration, day, time]
	#Busstop is the new index
	train_df.reset_index()

	#Extract Features Columns
	#[bus_stop, day, time]
	train_X = train_df.drop(columns=['duration'])
	print('Training Input Features:')
	print(list(train_X))

	#Extract Training Result
	#[duration]
	train_Y = train_df[['duration']]
	print('Training Output Features:')
	print(list(train_Y))

	#Get values as float from input data
	train_X = train_X.values
	train_X = train_X.astype('float32')
	train_Y = train_Y.values
	train_Y = train_Y.astype('float32')

	# split into train and test sets
	#Split to 80 percent
	train_size = int(len(train_X) * 0.8)
	#Remaining for the test size
	test_size = len(train_X) - train_size

	train_X, test_X = train_X[0:train_size,:],train_X[train_size:len(train_X),:]
	train_Y, test_Y = train_Y[0:train_size,:],train_Y[train_size:len(train_Y),:]

	#get number of columns in training data
	n_cols = train_X.shape[1]

	#https://stackoverflow.com/questions/47877475/keras-tensorboard-plot-train-and-validation-scalars-in-a-same-figure
	logdir = "logs/scalars/" + datetime.now().strftime("%Y%m%d-%H%M%S")
	tensorboard_callback = keras.callbacks.TensorBoard(log_dir=logdir)


	# if(new_model == True):
	if not path.exists('./models/' + bus_service):
		os.makedirs('./models/' + bus_service)
  
	model_path = './models/' + bus_service + '/' + model_path

	#Scaler filename
	inputscalerfile = './models/' + bus_service + '/input_scaler.sav'
	outputscalerfile = './models/' + bus_service + '/output_scaler.sav'

	#Scale data
	scalar_input, scalar_output = RobustScaler(), RobustScaler()
	scalar_input.fit(train_X)
	train_X = scalar_input.transform(train_X)
	pickle.dump(scalar_input, open(inputscalerfile, 'wb'))

	#scalar_input.fit(test_X)
	test_X = scalar_input.transform(test_X)

	scalar_output.fit(train_Y)
	train_Y = scalar_output.transform(train_Y)
	pickle.dump(scalar_output, open(outputscalerfile, 'wb'))

	#scalar_output.fit(test_Y)
	test_Y = scalar_output.transform(test_Y)

	#Create Layers
	model = create_model(n_cols)

	# compile the keras model
	# opt = keras.optimizers.Adam(learning_rate=0.01)
	model.compile(optimizer='adam', loss='mean_squared_error', metrics = ['mae'])

	#Save model at checkpoint
	checkpoint = ModelCheckpoint(model_path, monitor='loss', verbose=0, save_best_only=True, mode='min')

	# fit the keras model on the dataset
	try:
		#Train model
		history = model.fit(train_X, train_Y, epochs=200, verbose = 0, validation_data=(test_X, test_Y), callbacks = [checkpoint,tensorboard_callback])
		#plot history
		plt.plot(history.history['loss'], label='train')
		plt.plot(history.history['val_loss'], label='test')
		plt.xlabel('Number of Epochs')
		plt.ylabel('Mean Squared Error')
		plt.legend()
		plt.savefig('./models/' + bus_service + '/evaluation.png')
	except KeyboardInterrupt:
		print('Exiting')

	# evaluate the keras model
	train_score = model.evaluate(train_X, train_Y, verbose = 0)
	test_score = model.evaluate(test_X, test_Y, verbose=0)

	print('Bus Service', bus_service)
	print('Train Accuracy' , train_score)
	print('Test Accuracy', test_score)

	print_evaluation(model, train_score, test_score, start_time)
 
#Capture start time
start_time = time.time()

# file_dataset = input("Enter the location of dataset to clean : ") # Location of dataset to clean
file_dataset = "output/BFV7518-prep_1.csv"

if path.exists(file_dataset) is True:
    bus_service = input("Bus_Service : ") # Save file location
    model_path = "model.hdf5"
    train_data(file_dataset, bus_service, model_path)
else:
    print("The file doesn't exist")
    

