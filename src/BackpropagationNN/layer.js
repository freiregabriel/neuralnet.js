var ActivationFunction = require('../Utils/activation');
var zeros = require('../Utils/zeros');
var randomWeights = require('../Utils//randomWeights');

function Layer(inputSize, outputSize) {
    this.input = zeros(inputSize + 1);
    this.output = zeros(outputSize);
    this.weights = randomWeights((inputSize + 1) * outputSize);
    this.dWeights = zeros((inputSize + 1) * outputSize); //change of weights in the previous iterations
    this.inputSize = inputSize;
    this.outputSize = outputSize;
}

Layer.prototype = {
    //Forward process
    run: function(inputArray) {
        //check if inputArray is an object or an array
        if (inputArray instanceof Array) {
            this.input = inputArray.slice(); //copy the array
        } else if (inputArray instanceof Object) {
            this.input = Object.assign(inputArray); //copy the object
            var input = [];
            for (var key in this.input) {
                input.push(this.input[key]);
            }

            this.input = input.slice();
        }
        // add 1 more for bias / anchor value / helps with fitting the data better
        this.input.push(1);

        //the offset variable helps with the distribution of weights for each input
        var offset = 0,
            newOutput;
        for (var i = 0; i < this.output.length; i++) {
            for (var j = 0; j < this.input.length; j++) {
                //calculate the output based on the input and its weights
                this.output[i] += this.weights[offset + j] * this.input[j];
            }
            //normalize the output using the sigmoid activation function
            this.output[i] = ActivationFunction.sigmoid(this.output[i]);
            offset += this.input.length;
        }
        //and return a copy of the output from the neural network
        return this.output.slice();;
    },

    train: function(error, learningRate, momentum) {
        //the offset variable helps with the distribution of weights for each input
        var offset = 0,
            nextError = zeros(this.input.length);

        for (var i = 0; i < this.output.length; i++) {
            //calculate the delta
            var delta = error[i] * ActivationFunction.dSigmoid(this.output[i])

            for (var j = 0; j < this.input.length; j++) {

                var weightIndex = offset + j;
                //calculate the next error
                nextError[j] += this.weights[weightIndex] * delta;

                /**
                 * --------------------------
                 * Mathematical representation of weight adjustments
                 * --------------------------
                 * Δw(t): current weight
                 * α: learningRate
                 * (Δ*input): gradient
                 * μ: momentum
                 * Δw(t - 1): previous weight
                 * --------------------------
                 *  adjust the weights
                 * Δw(t) = α * (Δ*input) + μ * Δw(t - 1) < the following code represents this formula 
                 */
                var dw = this.input[j] * delta * learningRate;
                this.weights[weightIndex] += this.dWeights[weightIndex] * momentum + dw;
                this.dWeights[weightIndex] = dw;

            }
            offset += this.input.length;
        }

        //return the next error
        return nextError;
    }
}

module.exports = Layer;