## Checkpoint 21 Web development for Robotics

Terminal 1 Simulator

```
source ~/simulation_ws/devel/setup.bash
roslaunch tortoisebot_gazebo tortoisebot_docking.launch
```

Terminal 2 Rosbridge

```
source ~/simulation_ws/devel/setup.bash
roslaunch course_web_dev_ros web.launch
```

Terminal 3 Slam on Rviz

```
source ~/simulation_ws/devel/setup.bash
roslaunch tortoisebot_slam mapping.launch
```

Terminal 4 Action Server

```
source ~/simulation_ws/devel/setup.bash
rosrun course_web_dev_ros tortoisebot_action_server.py
```

Terminal 5 Web Server

```
cd ~/webpage_ws/tortoisebot_webapp
python -m http.server 7000
```

Terminal 6 tf2_web server

```
roslaunch course_web_dev_ros tf2_web.launch
```

Terminal 7 Get address

```
rosbridge_address
webpage_address
```

Teleopt commands

```
rosrun teleop_twist_keyboard teleop_twist_keyboard.py
```