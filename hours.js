let endpoint = "pasteGoogleAppsScriptEndpointHere";
let successSound = new Audio('Twotone.wav');
let errorSound = new Audio('Modiferz.wav');
function transformTabularData(rawdata) {
    // This is an example of array destructuring.
    // - extract the first item in the array into local variable `headers`
    // - assign the remainder of the array to local variable `data` using the rest operator
    const [columns, ...rows] = rawdata;
  
    // do a 1 for 1 conversion of each row into an object and return a new array
    return rows.map((values) =>
      // create a new object per row
      // use the column headers as the object key
      // and the corresponding row value as the object value
      columns.reduce((obj, column, index) => {
        obj[column] = values[index];
        return obj;
      }, {})
    );
  }

const app = {
    name: "Hours",
    data() {
        return {
            form: {
                userID: '',
                operation: ''
            },
            mode: {
                operation: 'checkIn',
                text: 'Check In',
            },
            localLog: [],
            usersData: [],
            onLine: navigator.onLine,
        }
    },
    mounted() {
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
        window.addEventListener('keydown', (e) => {
            if (e.key == '*') {
              location.reload();
            }
        });
        document.getElementById('userID').focus();
        this.getUsersData();
    },
    beforeDestroy() {
        window.removeEventListener('online', this.updateOnlineStatus);
        window.removeEventListener('offline', this.updateOnlineStatus);
        window.removeEventListener('keydown');

    },
    computed: {
        localLogEntries() {
            return this.localLog.slice(-10);
        }
    },
    methods: {
        updateOnlineStatus(e) {
            const {
                type
            } = e;
            this.onLine = type === 'online';
        },
        async submitForm() {
            let response
            let responseJSON
            //if user types +00 set mode to checkIn
            if (this.form.userID === "+00") {
                this.mode.operation = "checkIn"
                this.mode.text = "Check In"
                this.form.userID = ""
                this.getUsersData();
            }
            //if user types +01 set mode to checkOut
            else if (this.form.userID === "+01") {
                this.mode.operation = "checkOut"
                this.mode.text = "Check Out"
                this.form.userID = ""
                this.getUsersData();
            }
            //if user submits nothing do nothing
            else if (this.form.userID === "") { 
                this.getUsersData();
            }
            else {
                await fetch(endpoint + '?'
                    + new URLSearchParams({
                        userID: this.form.userID,
                        operation: this.mode.operation,
                    }),
                    {
                        method: 'GET',
                        redirect: 'follow',
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.status === "error") {
                            errorSound.play();
                        }
                        else if (data.status === "success") {
                            successSound.play();
                        }
                        this.localLog.push({
                            userID: this.form.userID,
                            operation: this.mode.operation,
                            status: data.status,
                            message: data.message
                        })
                    }
                        );
                this.form.userID = "";
                this.getUsersData();
            }
        },
        async getUsersData() {
            await fetch(endpoint + '?'
                + new URLSearchParams({
                    operation: "getUsersData",
                }),
                {
                    method: 'GET',
                    redirect: 'follow',
                })
                .then(response => response.json())
                .then(data=> {
                    this.usersData = (transformTabularData(data));
                    console.log(this.usersData);
                });
            },
        convertTimestampToDuration(timestamp) {
            d = Number(timestamp);
        
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
        
            return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2);
            // https://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss
        }
        },
        watch: {
            onLine(v) {
                if (v) {
                    this.showBackOnline = true;
                    setTimeout(() => {
                        this.showBackOnline = false;
                    }, 1000);
                }
            }
        },
}
Vue.createApp(app).mount('#app');