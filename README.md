## Easy PID Controller v2  Node for Node-RED
This is a fork of https://github.com/hj91/node-red-contrib-easy-pid-controller

The `easy-pid-controller-2` is a simple-to-use Node-RED node that provides Proportional-Integral-Derivative (PID) control functionalities. This node is designed to integrate easily with various control systems and offers configuration options for `0-10V` and `4-20mA` control signals.

The Advantage of this Fork is that you can set an Limiter for the integrator. You can set an min and max value of the integrator to limit regulation.

### Features

- Easy to configure PID parameters: Kp, Ki, Kd.
- Capability to set max and min values for integrator to avoid integral windup.
- Setpoint (`SV`) input for desired control level.
- Process Variable (`PV`) input to feedback the current state.
- Output values for PID components (P, I, D), final output signal, and mapped value signal.
- Choice of control signal types: `0-10V` or `4-20mA`.
- Real-time status updates during runtime for easier debugging and monitoring.

### Installation

```bash
npm install node-red-contrib-easy-pid-controller-2
```

### Usage

1. Drag and drop the `easy-pid-controller-2` node into your Node-RED flow.
2. Double click on the node to configure its parameters.
3. Connect it to other nodes to provide `PV` and `SV` inputs and get the output signals.
4. Deploy and monitor the control signal in real-time.

### Inputs

- `SV`: The desired setpoint value for the controller. Previously was part of the node's configuration, now can be sent as a `msg.payload` with the topic `SV`.
- `PV`: The process variable or the current state of the system.
- `auto`: Boolean signal. If set to `true`, the PID loop starts.

### Outputs

The node outputs an object payload containing:

- `PV`: The current process variable.
- `SV`: The setpoint.
- `P`, `I`, `D`: PID component values.
- `I_Max` ,`I_Min`: integrator max and min value
- `Output`: The final PID calculated signal.
- `Value`: The mapped control signal according to the sensor type (`0-10V` or `4-20mA`).

### Changelog
#### v1.2.8

- **BugFix**: Fixed Value Error "Infinity" by using negative KI Values. 

#### v1.2.7

- **Added**: Limitation for integrator. Now you can set a limit for IMax and Imin to avoid integral windup.
#### v1.2.1

- **Added**: Node status updates during runtime to display relevant information like current PV, PID activation state, and more.
  
#### v1.2.0

- **Changed**: Moved the Setpoint (`SV`) from node configuration to `msg.payload` with the topic `SV`.

#### v1.1.0

- **Added**: New output value `Value` that provides the direct control signal based on the sensor type configuration.
- **Improved**: Code documentation and error handling for invalid inputs.

#### v1.0.0

- Initial release with basic PID functionalities.
- Support for `0-10V` and `4-20mA` signal types.

### Contributing

Contributions to improve the node or fix any issues are always welcome. Please submit a pull request on the GitHub repository.

### License

GPL-3.0 License. See `LICENSE` file for details.

### Example

Visit the `examples/` directory for a sample flow illustrating the usage of the node.

## Author

Copyright 2025 Tomel218 


