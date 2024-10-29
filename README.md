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

Publish a goal to first checkpoint (0.7,-0.48)

```
 rostopic pub /tortoisebot_as/goal course_web_dev_ros/WaypointActionActionGoal "header:
  seq: 0
  stamp:
    secs: 0
    nsecs: 0
  frame_id: ''
goal_id:
  stamp:
    secs: 0
    nsecs: 0
  id: ''
goal:
  position:
    x: 0.7
    y: -0.48
    z: 0.0"
```

Waypoint position Data 
wp : location x,y
1 : 0.7, -0.48
2 : 0.680851835461391, 0.5046365559674899
3 : 0.21495551839700774, 0.5368169079826496
4 : 0.23105951276897543, 0.04812895919547926
5 : -0.13007296166597881, 0.010690406810986703
6 : -0.18288059001897242, -0.43215748770886586
7 : -0.15489504057272618, 0.4629887743221526
8 : -0.5495752177522534, -0.5476146745173234
9 : -0.6091414439352052, 0.49241421900139143