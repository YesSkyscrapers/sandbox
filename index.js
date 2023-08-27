console.log('started')
//
const test = () => {
    console.log(10000)
    setTimeout(() => {
        test()
    }, 10000)
}

test()
