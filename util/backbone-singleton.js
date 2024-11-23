define(["underscore", "backbone"], function(_, Backbone) {
    // Helper function to enforce singleton behavior
    var makeSingleton = function(Class, methodNames) {
        // Derive methodNames if not provided, excluding private methods
        methodNames = methodNames || _.reject(_.keys(Class.prototype), function(key) {
            return key.startsWith("_"); // Exclude methods starting with '_'
        });

        // Modify the constructor to implement the singleton pattern
        Class.prototype.constructor = function() {
            if (!Class._instance) {
                Class._instance = this; // Save the instance
                // Call the original constructor logic
                Class.prototype.constructor.apply(this, arguments);
            }
            return Class._instance; // Return the singleton instance
        };

        // Add a static method to get the singleton instance
        Class.getInstance = function() {
            if (!this._instance) {
                this._instance = new Class(); // Create a new instance if it doesn't exist
            }
            return this._instance;
        };

        // Create static wrappers for each method in methodNames
        _.each(methodNames, function(methodName) {
            Class[methodName] = function() {
                var instance = Class.getInstance(); // Get the singleton instance
                return instance[methodName].apply(instance, arguments); // Call the instance method
            };
        });

        return Class; // Return the modified class
    };

    // Add a `makeSingleton` method to Backbone.Model
    Backbone.Model.makeSingleton = function(methodNames) {
        makeSingleton(this, methodNames);
    };

    // Export the makeSingleton function for reuse
    return {
        makeSingleton: makeSingleton
    };
});
