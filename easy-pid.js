/**
 * easy-pid.js - Copyright 2025 Tomel218 
 * 
 * Licensed under the GNU General Public License, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * https://www.gnu.org/licenses/gpl-3.0.html
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

const PIDController = require('simple-pid-controller-2');

module.exports = function (RED) {
    function EasyPIDControllerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let controller = null;

        // Parse configuration values
        try {
            node.k_p = Number(config.k_p);
            node.k_i = Number(config.k_i);
            node.k_d = Number(config.k_d);
            node.i_max = Number(config.i_max);
            node.i_min = Number(config.i_min);
            node.dt = Number(config.dt);
            node.sensor_type = config.sensor_type;
            node.range_min = Number(config.range_min);
            node.range_max = Number(config.range_max);
        } catch (error) {
            node.error("Error parsing configuration parameters: " + error.message);
            return;
        }

        node.currentValue = 0;

        // Validate the parsed values
        if (isNaN(node.k_p) || isNaN(node.k_i) || isNaN(node.k_d) || isNaN(node.dt) || 
            isNaN(node.range_max) || isNaN(node.range_min)) {
            node.error("Invalid parameters: Ensure Kp, Ki, Kd, dt, range_min, and range_max are numbers.");
            return;
        }

        // Check for valid parameter values
        if (node.dt <= 0) {
            node.error("Invalid parameter: dt must be greater than 0.");
            return;
        }

        if (node.i_max < 0) {
            node.error("Invalid parameter: IMax must be a positive number.");
            return;
        }

        if (node.i_min > 0) {
            node.error("Invalid parameter: IMin must be a negative number.");
            return;
        }

        // Handle zero values for i_max and i_min
        if (node.i_max === 0) {
            node.i_max = Infinity;
        }

        if (node.i_min === 0) {
            node.i_min = -Infinity;
        }

        // Initialize the PID controller
        try {
            controller = new PIDController(node.k_p, node.k_i, node.k_d, node.i_max, node.i_min);
        } catch (error) {
            node.error("Error creating PID Controller: " + error.message);
            return;
        }

        let pidTimer = null;

        // Map a value to a given range
        function mapToRange(value, inputMin, inputMax, outputMin, outputMax) {
            return outputMin + ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin);
        }

        // Handle incoming messages
        node.on('input', function (msg) {
            try {
                if (msg.topic === 'SV') {
                    controller.setTarget(msg.payload);
                    node.status({ fill: "yellow", shape: "dot", text: "Setpoint updated to: " + msg.payload });
                }

                if (msg.topic === 'auto' && msg.payload === true) {
                    node.status({ fill: "green", shape: "dot", text: "PID active" });

                    if (pidTimer === null) {
                        pidTimer = setInterval(function () {
                            let pidOutput = controller.update(node.currentValue);

                            // Map the PID output to the user's range
                            let scaledOutput = mapToRange(pidOutput, node.range_min, node.range_max, 0, 1);

                            let signal, value;

                            // Handle different sensor types
                            if (node.sensor_type === "0-10V") {
                                signal = scaledOutput * 10;  // Map to [0, 10]
                                value = mapToRange(node.currentValue, node.range_min, node.range_max, 0, 10); // Map current value to [0, 10]
                            } else {
                                signal = 4 + scaledOutput * 16; // Map to [4, 20]
                                value = mapToRange(node.currentValue, node.range_min, node.range_max, 4, 20); // Map current value to [4, 20]
                            }

                            let msgOutput = {
                                payload: {
                                    PV: node.currentValue,
                                    SV: controller.target,
                                    P: controller.p,
                                    I: controller.i,
                                    D: controller.d,
                                    I_Max: controller.i_max,
                                    I_Min: controller.i_min,
                                    Output: signal,
                                    Value: value  // Adding the new 'Value' field here - Use Range node if required..
                                }
                            };

                            node.send(msgOutput);
                        }, node.dt * 1000);
                    }
                } else if (msg.topic === 'auto' && msg.payload === false) {
                    if (pidTimer !== null) {
                        clearInterval(pidTimer);
                        pidTimer = null;
                        node.status({ fill: "red", shape: "ring", text: "PID inactive" });
                    }
                }

                if (msg.topic === 'PV') {
                    if (typeof msg.payload !== 'number') {
                        node.error("Received PV value is not a number.");
                        return;
                    }
                    node.currentValue = msg.payload;
                    node.status({ fill: "blue", shape: "ring", text: "Current PV: " + node.currentValue });
                }
            } catch (error) {
                node.error("Error handling input: " + error.message);
                node.status({ fill: "red", shape: "ring", text: "Error: " + error.message });
            }
        });

        // Handle node closure
        node.on('close', function () {
            try {
                if (pidTimer !== null) {
                    clearInterval(pidTimer);
                    pidTimer = null;
                }
            } catch (error) {
                node.error("Error handling node closure: " + error.message);
            }
        });
    }

    RED.nodes.registerType("easy-pid-controller-2", EasyPIDControllerNode);
};
