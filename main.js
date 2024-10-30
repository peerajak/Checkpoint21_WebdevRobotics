var app = new Vue({
    el: '#app',
    // storing the state of the page
    data: {
        connected: false,
        ros: null,
        viewer: null,
        logs: [],
        loading: false,
        isShowMap: false,
        isShowCamera: false,
        isShowRobotModel: false,
        mapViewer: null,
        mapGridClient: null,
        rosbridge_address: 'wss://i-0e8a19a0d6284ed9c.robotigniteacademy.com/30c3b09d-6a0d-44c7-9520-6b7ee28bbab5/rosbridge/',
        port: '9090',
        // dragging data
        dragging: false,
        x: 'no',
        y: 'no',
        dragCircleStyle: {
            margin: '0px',
            top: '0px',
            left: '0px',
            display: 'none',
            width: '75px',
            height: '75px',
        },
        // joystick valules
        joystick: {
            vertical: 0,
            horizontal: 0,
        },
        // publisher
        pubInterval: null,
        // 3D stuff
        viewer3d: null,
        tfClient: null,
        urdfClient: null,
        //action server
        goal: null,
        action: {
            goal: { position: {x: 0, y: 0, z: 0} },
            feedback: { position: 0, state: 'idle' },
            result: { success: false },
            status: { status: 0, text: '' },
        },
        wp_array : [
        [ 0.7, -0.48],
        [ 0.680851835461391, 0.5046365559674899],
        [ 0.23105951276897543, 0.5368169079826496],
        [ 0.23105951276897543, 0.04812895919547926],
        [ -0.15, 0.010690406810986703],
        [ -0.18288059001897242, -0.43215748770886586],
        [ -0.15489504057272618, 0.4629887743221526],
        [ -0.5495752177522534, -0.5476146745173234],
        [ -0.6091414439352052, 0.49241421900139143]
                ],
        is_wp_array_reached : [false,false,false,false,false,false,false,false,false],
        isOnAction : false,
        WPnum: 1

    },
    // helper methods to connect to ROS
    methods: {
        connect: function() {
            this.logs.unshift('connecting...')
            this.loading = true
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!')
                this.connected = true
                this.loading = false
                this.isShowCamera = false
                this.isShowMap = false
                this.isShowRobotModel = false
                this.pubInterval = setInterval(this.publish, 100)
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false   
                this.unset3DViewer()  
                this.unsetCamera()
                this.unsetMap()
                clearInterval(this.pubInterval)         
            })
        },
        showMap: function(){
            this.isShowMap = true
            this.setMap()
         },
        closeMap: function(){
            this.isShowMap = false
            this.unsetMap()
        },
        showCamera: function() {
            this.setCamera()
            this.isShowCamera = true
        },
        closeCamera: function() {
            this.isShowCamera = false
            this.unsetCamera()
        },
        showRobotModel: function() {
            this.setup3DViewer()
            this.isShowRobotModel = true
        },
        closeRobotModel: function () {
            this.isShowRobotModel = false
            this.unset3DViewer()  
        },
        setMap: function(){
            if(this.mapViewer == null){
                    this.mapViewer = new ROS2D.Viewer({
                    divID: 'divMap',
                    width: 420,
                    height: 360
                })
                        // Setup the map client.
            this.mapGridClient = new ROS2D.OccupancyGridClient({
                ros: this.ros,
                rootObject: this.mapViewer.scene,
                continuous: true,
            })
            scaleFactor = 0.125
            // Scale the canvas to fit to the map
            this.mapGridClient.on('change', () => {
                this.mapViewer.scaleToDimensions(this.mapGridClient.currentGrid.width*scaleFactor, this.mapGridClient.currentGrid.height*scaleFactor);
                this.mapViewer.shift(this.mapGridClient.currentGrid.pose.position.x*scaleFactor, this.mapGridClient.currentGrid.pose.position.y*scaleFactor)
            })
            }

        },
        setCamera: function() {

            if(this.viewer == null){
                let without_wss = this.rosbridge_address.split('wss://')[1]
                console.log(without_wss)
                let domain = without_wss.split('/')[0] + '/' + without_wss.split('/')[1]
                console.log(domain)
                let host = domain + '/cameras'
                this.viewer = new MJPEGCANVAS.Viewer({
                divID: 'divCamera',
                host: host,
                width: 320,
                height: 240,
                topic: '/camera/image_raw',
                ssl: true,
            })
            }

        },
        startDrag() {
            this.dragging = true
            this.x = this.y = 0
        },
        stopDrag() {
            this.dragging = false
            this.x = this.y = 'no'
            this.dragCircleStyle.display = 'none'
            this.resetJoystickVals()
        },
        doDrag(event) {
            if (this.dragging) {
                this.x = event.offsetX
                this.y = event.offsetY
                let ref = document.getElementById('dragstartzone')
                this.dragCircleStyle.display = 'inline-block'

                let minTop = ref.offsetTop - parseInt(this.dragCircleStyle.height) / 2
                let maxTop = minTop + 200
                let top = this.y + minTop
                this.dragCircleStyle.top = `${top}px`

                let minLeft = ref.offsetLeft - parseInt(this.dragCircleStyle.width) / 2
                let maxLeft = minLeft + 200
                let left = this.x + minLeft
                this.dragCircleStyle.left = `${left}px`

                this.setJoystickVals()
            }
        },
        setJoystickVals() {
            this.joystick.vertical = -1 * ((this.y / 200) - 0.5)
            this.joystick.horizontal = +1 * ((this.x / 200) - 0.5)
        },
        resetJoystickVals() {
            this.joystick.vertical = 0
            this.joystick.horizontal = 0
        },
        disconnect: function() {
            this.ros.close()
        },
        setup3DViewer() {
            this.viewer3d = new ROS3D.Viewer({
                background: '#cccccc',
                divID: 'div3DViewer',
                width: 400,
                height: 300,
                antialias: true,
                fixedFrame: 'odom'
            })

            // Add a grid.
            this.viewer3d.addObject(new ROS3D.Grid({
                color:'#0181c4',
                cellSize: 0.5,
                num_cells: 20
            }))

            // Setup a client to listen to TFs.
            this.tfClient = new ROSLIB.TFClient({
                ros: this.ros,
                angularThres: 0.01,
                transThres: 0.01,
                rate: 10.0
            })

            // Setup the URDF client.
            this.urdfClient = new ROS3D.UrdfClient({
                ros: this.ros,
                param: 'robot_description',
                tfClient: this.tfClient,
                // We use "path: location.origin + location.pathname"
                // instead of "path: window.location.href" to remove query params,
                // otherwise the assets fail to load
                path: location.origin + location.pathname,
                rootObject: this.viewer3d.scene,
                loader: ROS3D.COLLADA_LOADER_2
            })


        },
        unsetMap() {
            document.getElementById('divMap').innerHTML = ''
            this.mapViewer = null
        },
        unsetCamera() {
            document.getElementById('divCamera').innerHTML = ''
            this.viewer = null
        },
        unset3DViewer() {
            document.getElementById('div3DViewer').innerHTML = ''
            this.viewer3d = null
        },
        publish: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: this.joystick.vertical, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: this.joystick.horizontal, },
            })
            topic.publish(message)
        },
        sendCommand: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 1, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0.5, },
            })
            topic.publish(message)
        },
        disconnect: function() {
            this.ros.close()
            this.goal = null
        },
        sendGoal: function() {
            let actionClient = new ROSLIB.ActionClient({
                ros : this.ros,
                serverName : '/tortoisebot_as',
                actionName : 'course_web_dev_ros/WaypointActionAction'
            })

            this.goal = new ROSLIB.Goal({
                actionClient : actionClient,
                goalMessage: {
                    ...this.action.goal
                }
            })

            this.goal.on('status', (status) => {
                this.action.status = status
            })

            this.goal.on('feedback', (feedback) => {
                this.action.feedback = feedback
            })

            this.goal.on('result', (result) => {
                this.action.result = result 
                this.isOnAction = false
                let wpnum_idx = this.WPnum - 1
                if(this.action.result.success){
                    this.is_wp_array_reached[wpnum_idx] = true
                }else{
                    this.is_wp_array_reached[wpnum_idx] = false
                }
                
            })
            this.isOnAction = true
            this.goal.send()
        },
        cancelGoal: function() {
            this.goal.cancel()
        },
        WP_button_clicked: function (wpname) {            
            this.WPnum = parseInt(wpname.charAt(2))
            let wpnum_idx = this.WPnum - 1
            this.logs.unshift(wpname + ": " + String(this.wp_array[wpnum_idx][0]) + ',' +  String(this.wp_array[wpnum_idx][1]))
            this.action.goal.position.x = this.wp_array[wpnum_idx][0]
            this.action.goal.position.y = this.wp_array[wpnum_idx][1]
            this.sendGoal()
        },
    },
    mounted() {
        window.addEventListener('mouseup', this.stopDrag)
    },
})