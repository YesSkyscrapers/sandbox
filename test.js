var buffer = require('buffer')
var udp = require('dgram')
// creating a client socket
var client = udp.createSocket('udp4')

//buffer msg

client.connect(3333, '127.0.0.1', () => {
    var data = Buffer.from('siddheshrane')

    client.on('message', function (msg, info) {
        console.log('Data received from server : ' + msg.toString())
        console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port)
    })

    setTimeout(() => {
        client.close()
    }, 1000)

    //sending msg
    client.send(data, function (error) {
        if (error) {
            client.close()
        } else {
            console.log('Data sent !!!')
        }
    })

    var data1 = Buffer.from('hello')
    var data2 = Buffer.from('world')

    //sending multiple msg
    client.send([data1, data2], function (error) {
        if (error) {
            client.close()
        } else {
            console.log('Data sent !!!')
        }
    })
})
