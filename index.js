var udp = require('dgram')
const { argv } = require('process')

// --------------------creating a udp server --------------------

// creating a udp server
var server = udp.createSocket('udp4')
let players = []
let id = 1

// emits when any error occurs
server.on('error', function (error) {
    console.log('Error: ' + error)
    server.close()
})

const broadcast = (targets, obj) => {
    targets.forEach((player) => {
        try {
            server.send(JSON.stringify(obj), player.info.port, player.info.address, function (error) {
                if (error) {
                    console.log(error)
                }
            })
        } catch (err) {}
    })
}

const answer = (playerId, obj) => {
    try {
        //sending msg
        let player = getPlayerById(playerId)
        server.send(JSON.stringify(obj), player.info.port, player.info.address, function (error) {
            if (error) {
                console.log(error)
            }
        })
    } catch (err) {}
}

const getPlayerById = (id) => {
    return players.find((i) => Number(i.playerId) == Number(id))
}

// emits on new datagram msg
server.on('message', function (msg, info) {
    try {
        let data = JSON.parse(msg.toString())
        console.log(data)
        switch (data.action) {
            case 'registration': {
                let newPlayerId = id
                id = id + 1

                players.push({
                    playerId: newPlayerId,
                    info,
                    pos: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                })

                answer(newPlayerId, {
                    action: 'registrationEnd',
                    payload: newPlayerId
                })
                break
            }
            case 'updatePos': {
                let player = getPlayerById(data.playerId)
                if (!player) {
                    console.log('player not found')
                    console.log('current players', players)
                    console.log('data.playerId', data)

                    break
                }

                player.pos = {
                    ...data.payload
                }
                console.log(data.payload)
                console.log('current players', players)
                console.log(
                    'sending to',
                    players.filter((_player) => _player.playerId != player.playerId).map((i) => i.playerId)
                )
                broadcast(
                    players.filter((_player) => _player.playerId != player.playerId),
                    {
                        action: 'movePos',
                        payload: players.map((_player) => ({
                            playerId: _player.playerId,
                            pos: _player.pos
                        }))
                    }
                )
                break
            }
        }
    } catch (err) {
        console.log(err)
    }
})

//emits when socket is ready and listening for datagram msgs
server.on('listening', function () {
    var address = server.address()
    var port = address.port
    var family = address.family
    var ipaddr = address.address
    console.log('Server is started at port' + port)
    console.log('Server ip :' + ipaddr)
    console.log('Server is IP4/IP6 : ' + family)
})

//emits after the socket is closed using socket.close();
server.on('close', function () {
    console.log('Socket is closed !')
})

//server.bind(argv.find((i) => i.includes('port')).slice('-port:'.length), '127.0.0.1') //'89.223.71.181')
server.bind(2008, '89.223.71.181')

setTimeout(function () {
    server.close()
}, 80000000)
