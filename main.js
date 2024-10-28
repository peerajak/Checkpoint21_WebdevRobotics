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
        mapViewer: null,
        mapGridClient: null,
        rosbridge_address: 'wss://i-083e6ce4d6d7ab013.robotigniteacademy.com/153e62fb-e9ca-4d72-85a0-920258369a62/rosbridge/',
        port: '9090',
    },
    // helper methods to connect to ROS
    methods: {
        connect: function() {
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
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false              
            })
        },
        showMap: function(){
            this.isShowMap = true
            this.setMap()
         },
        closeMap: function(){
            this.isShowMap = false
        },
        showCamera: function() {
            this.setCamera()
            this.isShowCamera = true
        },
        closeCamera: function() {
            this.isShowCamera = false
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
            // Scale the canvas to fit to the map
            this.mapGridClient.on('change', () => {
                this.mapViewer.scaleToDimensions(this.mapGridClient.currentGrid.width, this.mapGridClient.currentGrid.height);
                this.mapViewer.shift(this.mapGridClient.currentGrid.pose.position.x, this.mapGridClient.currentGrid.pose.position.y)
            })
            }

        },
        setCamera: function() {
            let without_wss = this.rosbridge_address.split('wss://')[1]
            console.log(without_wss)
            let domain = without_wss.split('/')[0] + '/' + without_wss.split('/')[1]
            console.log(domain)
            let host = domain + '/cameras'
            if(this.viewer == null){
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
        disconnect: function() {
            this.ros.close()
        },
    },
    mounted() {
    },
})