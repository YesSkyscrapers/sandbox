var udp = require('dgram')
const { argv } = require('process')
var moment = require('moment')

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
    console.log(targets)
    targets.forEach((player) => {
        try {
            console.log('sending to raw, ', JSON.stringify(obj), player)
            server.send(JSON.stringify(obj), player.info.port, player.info.address, function (error) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('smth callback')
                }
            })
        } catch (err) {
            console.log(err)
        }
    })
}

const answer = (playerId, obj) => {
    return new Promise((resolve, reject) => {
        try {
            //sending msg
            let player = getPlayerById(playerId)
            server.send(JSON.stringify(obj), player.info.port, player.info.address, function (error) {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    resolve()
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}

const getPlayerById = (id) => {
    return players.find((i) => Number(i.playerId) == Number(id))
}

// emits on new datagram msg
server.on('message', function (msg, info) {
    console.log(moment().format('YYYY-MM-DDTHH:mm:ss.SSS'), 'come')
    try {
        let data = JSON.parse(msg.toString())
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
            case 'ping': {
                answer(data.playerId, {
                    action: 'pingAnswer'
                }).finally(() => {
                    console.log(moment().format('YYYY-MM-DDTHH:mm:ss.SSS'), 'exit')
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

                players = players.map((_player) => {
                    if (_player.playerId == player.playerId) {
                        return {
                            ..._player,
                            pos: {
                                ...data.payload
                            }
                        }
                    } else {
                        return _player
                    }
                })

                console.log(data.payload)
                console.log(
                    'sending to',
                    players.filter((_player) => _player.playerId != player.playerId).map((i) => i.playerId),
                    {
                        action: 'movePos',
                        payload: players.map((_player) => ({
                            playerId: _player.playerId,
                            pos: _player.pos
                        }))
                    }
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
        console.log(err, msg.toString())
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
server.bind(2021, '89.223.71.181')

setTimeout(function () {
    server.close()
}, 80000000)
