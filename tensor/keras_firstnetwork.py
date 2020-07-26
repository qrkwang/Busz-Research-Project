# first neural network with keras tutorial
from numpy import loadtxt
from keras.models import Sequential
from keras.layers import Dense
import matplotlib.pyplot as plt
plt.switch_backend('agg')

# load the dataset
dataset = loadtxt('pima-indians-diabetes.data.csv', delimiter=',')
# split into input (X) and output (y) variables
X = dataset[:,0:8]
y = dataset[:,8]

#Create model first
def create_model():
    # Declare model
	model = Sequential()
 
	#Add Layers
	model.add(Dense(20, input_dim=8, activation='relu'))
	model.add(Dense(100, activation='relu'))
	model.add(Dense(200, activation='relu'))
 
 	model.add(Dense(1, activation='relu'))
  
	return model

model = create_model()

# compile the keras model
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
# fit the keras model on the dataset
try:
	#Train model
	history = model.fit(X, y, epochs=150, batch_size=10)
	#plot history
	# plt.plot(history.history['loss'], label='train')
	# plt.plot(history.history['val_loss'], label='test')
	plt.xlabel('Number of Epochs')
	plt.ylabel('Mean Squared Error')
	plt.legend()
	plt.savefig('./models/123/evaluation.png')
except KeyboardInterrupt:
	print('Exiting')

# evaluate the keras model
_, accuracy = model.evaluate(X, y)
print('Accuracy: %.2f' % (accuracy*100))


#https://machinelearningmastery.com/evaluate-skill-deep-learning-models/
# train, test = split(data)
# model = fit(train.X, train.y)
# predictions = model.predict(test.X)
# skill = compare(test.y, predictions)