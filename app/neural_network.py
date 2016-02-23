# -*- coding: utf-8 -*-

import numpy as np


class NeuralNetwork:
    
    def __init__(self, input_size, hidden_size, output_size, learning_rate=0.1):
        self.hidden_weight = 0.1 * (np.random.random_sample((hidden_size, input_size+1)) - 0.5)
        self.output_weight = 0.1 * (np.random.random_sample((output_size, hidden_size+1)) - 0.5)
        self.output_size = output_size
        self.learning_rate = learning_rate


    def fit(self, X, y):
        train_size = X.shape[0]
        for i in range(train_size):
            x = X[i]
            t = self.to_formatted_array(y[i])
            self.fit_step(x, t)

            
    def fit_step(self, x, t):
        z, y = self.fire(x)
        dy = (y - t) * y * (1 - y)
        dz = (self.output_weight.T.dot(dy))[1:] * z * (1 - z)

        hidden_input = np.r_[np.array([1]), x]
        self.hidden_weight -= self.learning_rate * dz.reshape(-1, 1) * hidden_input
        
        output_input = np.r_[np.array([1]), z]
        self.output_weight -= self.learning_rate * dy.reshape(-1, 1) * output_input

        
    def to_formatted_array(self, y):
        formatted_y = np.zeros(self.output_size)
        formatted_y.put(y, 1)
        return formatted_y


    def fire(self, x):
        sigmoid = lambda x: 1. / (1. + np.exp(-x))

        z = np.vectorize(sigmoid)(self.hidden_weight.dot(np.r_[np.array([1]), x]))
        y = np.vectorize(sigmoid)(self.output_weight.dot(np.r_[np.array([1]), z]))

        return (z, y)
    
    
    def score(self, X_test, y_test):
        ok = 0
        test_size = X_test.shape[0]
        for i in range(test_size):
            xx = X_test[i]
            yy = y_test[i]
            pred = self.predict(xx)
            if int(yy) == int(pred):
                ok += 1
        return ok / y_test.shape[0]


    def predict(self, x):
        z, y = self.fire(x)
        return np.array(y).argmax()


    def save(self, fpath):
        np.savez(fpath, hidden=self.hidden_weight, output=self.output_weight)


    def load(self, fpath):
        model = np.load(fpath)
        self.hidden_weight = model['hidden']
        self.output_weight = model['output']