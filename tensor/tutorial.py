import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Define Sequential model with 3 layers
model = keras.Sequential(
    [
        layers.Dense(2, activation="relu", name="layer1"),
        layers.Dense(3, activation="relu", name="layer2"),
        layers.Dense(4, name="layer3"),
    ]
)

#A Sequential model is appropriate for a plain stack of layers 
# where each layer has exactly one input tensor and one output tensor.

model.pop()
print(len(model.layers))
# Call model on a test input
x = tf.ones((3, 3))
y = model(x)

train, test = split(data)
model = fit(train.X, train.y)
predictions = model.predict(test.X)
skill = compare(test.y, predictions)


#https://machinelearningmastery.com/evaluate-skill-deep-learning-models/
# train, test = split(data)
# model = fit(train.X, train.y)
# predictions = model.predict(test.X)
# skill = compare(test.y, predictions)

