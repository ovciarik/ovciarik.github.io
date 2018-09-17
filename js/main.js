const DIMENSION_Y = 152
const DIMENSION_X = 152

const DARK_GREY = '#2a2b2f'
const GREY = '#4f4f57'
const LIGHT_GREY = '#9499a5'
const GREEN = '#2e8b57'

const DIMENSION_X_1 = DIMENSION_X-1
const DIMENSION_Y_1 = DIMENSION_Y-1 

let UNIVERSE = []
let PLAY_PAUSE = true
let ZOOM_LEVEL = 10
let EDIT_TOOL_TEMPLATE = []

let INIT_FN = initCanvas
let REDEAW_FN = redrawCanvas
let REZOOM_FN = rezoomCanvas
let EDIT_FN = editCanvasCell

// utils
function* intGenerator(start, stop){
    while (start < stop) {
        yield start
        start += 1
    }
}

// patterns
function generateChaosPattern(state){
    let offsetX = 75
    let offsetY = 30
    let pattern = [
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1]
    ]
    return generatePattern(state, pattern, offsetX, offsetY)
}

function generateGliderGun(state){
    let offsetX = 10
    let offsetY = 10
    let pattern = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,],
        [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
    ]
    return generatePattern(state, pattern, offsetX, offsetY)
}

// logic
// this function is optimized for speed, so doesn't look as nice as it could
function calculateNextState(state){
    let newState = []
    for (let x=0; x<DIMENSION_Y; x++){
        let newRow = []
        for (let y=0; y<DIMENSION_X; y++){
            let cell = state[x][y]
            if (x > 0 && y > 0 && x < DIMENSION_Y_1 && y < DIMENSION_X_1) {
                let aliveNeighbors = state[x-1][y-1] + state[x-1][y] + state[x-1][y+1] + state[x][y-1] + state[x][y+1] + state[x+1][y-1] + state[x+1][y] + state[x+1][y+1]
                if ( ( (cell === 0) && (aliveNeighbors !== 3) ) || ( (cell === 1) && ( (aliveNeighbors <= 1) || (aliveNeighbors >= 4) ) ) ){
                    newRow.push(0)
                } else {
                    newRow.push(1)
                }
            } else {
                newRow.push(0)
            }
        }
        newState.push(newRow)
    }
    return newState
}

function generateInitialState(width, height){
    let table = []
    for (let _ of intGenerator(0, width)){
        let row = []
        for (let _ of intGenerator(0, height)){
            row.push(0)
        }
        table.push(row)
    }
    return table
}

function generatePattern(state, pattern, offsetX, offsetY){
    let x = 0
    pattern.forEach(row => {
        let y = 0
        row.forEach(cell => {
            state[x+offsetX][y+offsetY] = cell
            y += 1
        })
        x += 1
    })
    return state
}

// HTML Canvas
function initCanvas(state){
    let universe = document.getElementById('universe')
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    universe.innerHTML = ''
    canvas.id = 'mainCanvas'
    canvas.width = (DIMENSION_X-2)*ZOOM_LEVEL
    canvas.height = (DIMENSION_Y-2)*ZOOM_LEVEL

    ctx.fillStyle = LIGHT_GREY
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // ctx.stroke()

    // ctx.beginPath()
    for (let x=0; x<=canvas.width; x+=ZOOM_LEVEL){
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.strokeStyle = DARK_GREY
        ctx.stroke()
    }

    for (let y=0; y<=canvas.height; y+=ZOOM_LEVEL){
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.strokeStyle = DARK_GREY
        ctx.stroke()
    }

    canvas.onmousedown = EDIT_FN

    universe.appendChild(canvas)
}

function redrawCanvas(state){
    let canvas = document.getElementById('mainCanvas')
    let ctx = canvas.getContext('2d')
    let x = 0
    state.forEach(row => {
        let y = 0
        row.forEach( cell => {
            if (x > 0 && y > 0 && x < DIMENSION_Y_1*ZOOM_LEVEL && y < DIMENSION_X_1*ZOOM_LEVEL){
                if (cell === 0) {
                    ctx.fillStyle = GREY

                } else {
                    ctx.fillStyle = GREEN
                }
                

                ctx.fillRect(y-ZOOM_LEVEL+1, x-ZOOM_LEVEL+1, ZOOM_LEVEL-1, ZOOM_LEVEL-1)
            }
            y += ZOOM_LEVEL
        })
        x += ZOOM_LEVEL
    })
    return state
}

function rezoomCanvas(){
    let canvas =  document.getElementById('mainCanvas')
    let ctx = canvas.getContext('2d')
    canvas.width = (DIMENSION_X-2)*ZOOM_LEVEL
    canvas.height = (DIMENSION_Y-2)*ZOOM_LEVEL

    ctx.fillStyle = LIGHT_GREY
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let x=0; x<=canvas.width; x+=ZOOM_LEVEL){
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.strokeStyle = DARK_GREY
        ctx.stroke()
    }

    for (let y=0; y<=canvas.height; y+=ZOOM_LEVEL){
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.strokeStyle = DARK_GREY
        ctx.stroke()
    }

    redrawCanvas(UNIVERSE)
}

function canvasDrawTemplate(mouseX, mouseY, template){

    mouseX = Math.floor(mouseX/ZOOM_LEVEL)*ZOOM_LEVEL
    mouseY = Math.floor(mouseY/ZOOM_LEVEL)*ZOOM_LEVEL

    let templateSizeX = template[0].length
    let templateSizeY = template.length

    let canvas = document.getElementById('mainCanvas')
    let ctx = canvas.getContext('2d')

    // ctx.fillStyle = LIGHT_GREY
    // ctx.fillRect(mouseX+1, mouseY+1, ZOOM_LEVEL-1, ZOOM_LEVEL-1)

    for(let y=0; y<templateSizeY; y++){
        for(let x=0; x<templateSizeX; x++){

            let cell = template[y][x]

            if (cell === 0) {
                ctx.fillStyle = LIGHT_GREY

            } else {
                ctx.fillStyle = GREEN
            }

            ctx.fillRect(mouseX+(x*ZOOM_LEVEL)+1, mouseY+(y*ZOOM_LEVEL)+1, ZOOM_LEVEL-1, ZOOM_LEVEL-1)

        }
    }
                

}

function editCanvasCell(e){
    let canvas = document.getElementById('mainCanvas')
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    let xx = Math.floor(x/ZOOM_LEVEL)+1
    let yy = Math.floor(y/ZOOM_LEVEL)+1
    let currentState = UNIVERSE[yy][xx]



    // canvasDrawTemplate(x, y, TEMPLATE)

    if (!(EDIT_TOOL_TEMPLATE && EDIT_TOOL_TEMPLATE.length > 0)){
        if (currentState === 1) {
            UNIVERSE[yy][xx] = 0
        } else {
            UNIVERSE[yy][xx] = 1
        }
    } else {
        let a = 0
        EDIT_TOOL_TEMPLATE.forEach( aa => {
            let b = 0 
            aa.forEach( bb => {
                if (UNIVERSE[yy+b] && UNIVERSE[yy+b][xx+a] !== undefined){
                    UNIVERSE[yy+b][xx+a] = bb
                }
                // console.log(bb)

                b += 1
            })
            a += 1
        })
    }


    REDEAW_FN(UNIVERSE)
}

// HTML Table
function initTable(state){
    let universe = document.getElementById('universe')
    let zoomLevel = ZOOM_LEVEL-3
    let table = document.createElement('table')
    universe.innerHTML = ''
    table.style.border = '1px solid #2a2b2f'
    table.style['border-collapse'] = 'collapse'

    let x = 0

    state.forEach(row => {
        let y = 0
        // if (x > 0 && x < DIMENSION_X){
        let tr = document.createElement('tr')
        // }
        row.forEach(_ => {
            if (x > 0 && y > 0 && x < DIMENSION_Y_1 && y < DIMENSION_X_1){
                let td = document.createElement('td')
                td.style['height'] = `${zoomLevel}px`
                td.style['min-width'] = `${zoomLevel}px`
                td.style.border = '1px solid #2a2b2f'
                td.style.background = '#4f4f57'
                td.id = `${x}_${y}`
                td.onclick = editTableCell
                tr.appendChild(td)
            }
            y += 1
        })
        if (x > 0 && x < DIMENSION_Y_1){
            table.appendChild(tr)
        }
        x += 1
    })

    universe.appendChild(table)
}

function redrawTable(state){
    let x = 0

    state.forEach(row => {
        let y = 0
        row.forEach( cell => {
            if (x > 0 && y > 0 && x < DIMENSION_Y_1 && y < DIMENSION_X_1){
                let elem = document.getElementById(`${x}_${y}`)
                if (cell === 0) {
                    if (elem.style.backgroundColor === 'rgb(46, 139, 87)'){
                        elem.style.background = '#4f4f57'
                    }
                } else {
                    if (elem.style.backgroundColor === 'rgb(79, 79, 87)'){
                        elem.style.background = '#2e8b57'
                    }
                }
            }
            y += 1
        })
        x += 1
    })

    return state
}

function rezoomTable(state){
    let zoomLevel = ZOOM_LEVEL-3
    let x = 0

    state.forEach(row => {
        let y = 0
        row.forEach(_ => {
            if (x > 0 && y > 0 && x < DIMENSION_Y_1 && y < DIMENSION_X_1){
                let elem = document.getElementById(`${x}_${y}`)
                elem.style['height'] = `${zoomLevel}px`
                elem.style['min-width'] = `${zoomLevel}px`
            }
            y += 1
        })
        x += 1
    })

    return state
}

function editTableCell(cell){
    let x = cell['target']['id'].split('_')[0]
    let y = cell['target']['id'].split('_')[1]
    let currentState = UNIVERSE[x][y]

    if (!(EDIT_TOOL_TEMPLATE && EDIT_TOOL_TEMPLATE.length > 0)){
        if (currentState === 1) {
            UNIVERSE[x][y] = 0
        } else {
            UNIVERSE[x][y] = 1
        }
    } else {
        let a = 0
        EDIT_TOOL_TEMPLATE.forEach( aa => {
            let b = 0 
            aa.forEach( bb => {
                if (UNIVERSE[Number(x)+a] && UNIVERSE[Number(x)+a][Number(y)+b] !== undefined){
                    UNIVERSE[Number(x)+a][Number(y)+b] = bb
                }
                b += 1
            })
            a += 1
        })
    }

    redrawTable(UNIVERSE)
}

// button callbacks
function playPauseToggle(){
    PLAY_PAUSE = !PLAY_PAUSE
}

function edit(){
    EDIT_TOOL_TEMPLATE = []
    PLAY_PAUSE = false
}

function editGlider(){
    EDIT_TOOL_TEMPLATE = [
        [0,0,1],
        [1,0,1],
        [0,1,1],
    ]
    PLAY_PAUSE = false

}

function nextStep(){
    if (!PLAY_PAUSE){
        UNIVERSE = calculateNextState(UNIVERSE)
        REDEAW_FN(UNIVERSE)
    }
}

function clear(){
    UNIVERSE = generateInitialState(DIMENSION_Y, DIMENSION_X)
    REDEAW_FN(UNIVERSE)
}

function chaosPattern(){
    UNIVERSE = generateInitialState(DIMENSION_Y, DIMENSION_X)
    UNIVERSE = generateChaosPattern(UNIVERSE)
    REDEAW_FN(UNIVERSE)
}

function gliderGun(){
    UNIVERSE = generateInitialState(DIMENSION_Y, DIMENSION_X)
    UNIVERSE = generateGliderGun(UNIVERSE)
    REDEAW_FN(UNIVERSE)
}

function zoomIn(){
    ZOOM_LEVEL += 1
    REZOOM_FN(UNIVERSE)
}

function zoomOut(){
    ZOOM_LEVEL -= 1
    REZOOM_FN(UNIVERSE)
}

function readSuccess(content){
    let pattern = JSON.parse(content.target.result)['state']
    UNIVERSE = generateInitialState(DIMENSION_Y, DIMENSION_X)
    UNIVERSE =  generatePattern(UNIVERSE, pattern, 0, 0)
    REDEAW_FN(UNIVERSE)
}

function fnImport(param){
    let file = param.target.files[0]
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = readSuccess
}

function fnExport(){
    let filename = 'gol.json'
    let jsonFile = JSON.stringify({'state': UNIVERSE})
    let blob = new Blob([jsonFile], { type: 'text/json;charset=utf-8;' })
    let link = document.createElement('a')
    let url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

function changeDrawingAPI(){

    let oldPlayState = PLAY_PAUSE

    PLAY_PAUSE = false

    if (INIT_FN == initCanvas){
        document.getElementById('changeDrawingAPIButton').innerHTML = 'Change Drawing API (Current: Table)'
        INIT_FN = initTable
        REDEAW_FN = redrawTable
        REZOOM_FN = rezoomTable
        EDIT_FN = editTableCell
    } else {
        document.getElementById('changeDrawingAPIButton').innerHTML = 'Change Drawing API (Current: Canvas)'
        INIT_FN = initCanvas
        REDEAW_FN = redrawCanvas
        REZOOM_FN = rezoomCanvas
        EDIT_FN = editCanvasCell
    }

    INIT_FN(UNIVERSE)
    REDEAW_FN(UNIVERSE)

    PLAY_PAUSE = oldPlayState
}

// init, mainLoop, main
function init(){
    // Add event listeners
    document.getElementById('playPauseButton').onclick = playPauseToggle
    document.getElementById('nextStepButton').onclick = nextStep
    document.getElementById('editButton').onclick = edit
    document.getElementById('editGliderButton').onclick = editGlider
    document.getElementById('clearButton').onclick = clear
    document.getElementById('chaosPatternButton').onclick = chaosPattern
    document.getElementById('gliderGunButton').onclick = gliderGun
    document.getElementById('zoomInButton').onclick = zoomIn
    document.getElementById('zoomOutButton').onclick = zoomOut
    document.getElementById('importButton').onchange = fnImport
    document.getElementById('exportButton').onclick = fnExport
    document.getElementById('changeDrawingAPIButton').onclick = changeDrawingAPI

    // generate initial state
    UNIVERSE = generateInitialState(DIMENSION_Y, DIMENSION_X)
    UNIVERSE = generateChaosPattern(UNIVERSE)

    INIT_FN(UNIVERSE)
    REDEAW_FN(UNIVERSE)

}

function mainLoop(){
    if (PLAY_PAUSE){
        let startTime = Date.now()
        UNIVERSE = calculateNextState(UNIVERSE)
        REDEAW_FN(UNIVERSE)
        let stopTime = Date.now()
        let totalLoopTime = stopTime-startTime
        let fps = Math.floor(1000/totalLoopTime)
        if (fps >= 100) {
            document.getElementById('FPS').innerHTML = `FPS: ${fps}`
        } else if (fps >= 10) {
            document.getElementById('FPS').innerHTML = `FPS: 0${fps}`
        } else {
            document.getElementById('FPS').innerHTML = `FPS: 00${fps}`
        }
    }
    window.setTimeout(mainLoop, 0)
}

function main(){
    init()
    mainLoop()
}

main()
