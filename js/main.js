const DIMENSION_X = 150 
const DIMENSION_Y = 150

const DARK_GREY = '#2a2b2f'
const GREY = '#4f4f57'
const LIGHT_GREY = '#9499a5'
const GREEN = '#2e8b57'

const DIMENSION_X_1 = DIMENSION_X-1 
const DIMENSION_Y_1 = DIMENSION_Y-1

let STATE = []
let PLAY_PAUSE = true
let ZOOM_LEVEL = 10

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
function calculateNextState(state){
    let newState = []
    for (let x=0; x<DIMENSION_X; x++){
        let newRow = []
        for (let y=0; y<DIMENSION_Y; y++){
            let cell = state[x][y]

            if (x > 0 && y > 0 && x < DIMENSION_X_1 && y < DIMENSION_Y_1) {
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
    universe.innerHTML = ''
    let canvas = document.createElement('canvas')
    canvas.id = 'mainCanvas'
    canvas.width = DIMENSION_Y*ZOOM_LEVEL
    canvas.height = DIMENSION_X*ZOOM_LEVEL
    let ctx = canvas.getContext('2d')

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
            if (cell === 0) {
                ctx.fillStyle = GREY

            } else {
                ctx.fillStyle = GREEN
            }
            ctx.fillRect(y, x, ZOOM_LEVEL-1, ZOOM_LEVEL-1)
            y += ZOOM_LEVEL
        })
        x += ZOOM_LEVEL
    })
    return state

}

function rezoomCanvas(){
    let canvas =  document.getElementById('mainCanvas')
    canvas.width = DIMENSION_Y*ZOOM_LEVEL
    canvas.height = DIMENSION_X*ZOOM_LEVEL
    let ctx = canvas.getContext('2d')

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
}

function editCanvasCell(e){
    let canvas = document.getElementById('mainCanvas')
    let x = e.clientX - canvas.offsetLeft
    let y = e.clientY - canvas.offsetTop
    let xx = Math.floor(x/ZOOM_LEVEL)
    let yy = Math.floor(y/ZOOM_LEVEL)
    let currentState = STATE[yy][xx]

    if (currentState === 1) {
        STATE[yy][xx] = 0
    } else {
        STATE[yy][xx] = 1
    }

    REDEAW_FN(STATE)
}

// HTML Table
function initTable(state){
    let universe = document.getElementById('universe')
    universe.innerHTML = ''
    let table = document.createElement('table')
    table.style.border = '1px solid #2a2b2f'
    table.style['border-collapse'] = 'collapse'
    let x = 0
    state.forEach(row => {
        let y = 0
        let tr = document.createElement('tr')
        row.forEach(_ => {
            let td = document.createElement('td')
            td.style['height'] = `${ZOOM_LEVEL}px`
            td.style['min-width'] = `${ZOOM_LEVEL}px`
            td.style.border = '1px solid #2a2b2f'
            td.style.background = '#4f4f57'
            td.id = `${x}_${y}`
            td.onclick = editTableCell
            tr.appendChild(td)
            y += 1
        })
        table.appendChild(tr)
        x += 1
    })
    universe.appendChild(table)
}

function redrawTable(state){
    let x = 0
    state.forEach(row => {
        let y = 0
        row.forEach( cell => {
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
            y += 1
        })
        x += 1
    })
    return state
}

function rezoomTable(state){
    let x = 0
    state.forEach(row => {
        let y = 0
        row.forEach(_ => {
            let elem = document.getElementById(`${x}_${y}`)
            elem.style['height'] = `${ZOOM_LEVEL}px`
            elem.style['min-width'] = `${ZOOM_LEVEL}px`
            y += 1
        })
        x += 1
    })
    return state
}

function editTableCell(cell){
    let x = cell['target']['id'].split('_')[0]
    let y = cell['target']['id'].split('_')[1]
    let currentState = STATE[x][y]

    if (currentState === 1) {
        STATE[x][y] = 0
    } else {
        STATE[x][y] = 1
    }
    redrawTable(STATE)
}

// button callbacks

function playPauseToggle(){
    PLAY_PAUSE = !PLAY_PAUSE
}

function edit(){
    PLAY_PAUSE = false
}

function nextStep(){
    if (!PLAY_PAUSE){
        STATE = calculateNextState(STATE)
        // redrawTable(STATE)
        REDEAW_FN(STATE)

    }
}

function clear(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    // redrawTable(STATE)
    REDEAW_FN(STATE)
}

function chaosPattern(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateChaosPattern(STATE)
    REDEAW_FN(STATE)
    // redrawTable(STATE)
}

function gliderGun(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateGliderGun(STATE)
    REDEAW_FN(STATE)
    // redrawTable(STATE)
}

function zoomIn(){
    ZOOM_LEVEL += 1
    REZOOM_FN(STATE)
    // rezoomTable(STATE)
}

function zoomOut(){
    ZOOM_LEVEL -= 1
    REZOOM_FN(STATE)
    // rezoomTable(STATE)
}

function readSuccess(content){
    let pattern = JSON.parse(content.target.result)['state']
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE =  generatePattern(STATE, pattern, 0, 0)
    // redrawTable(STATE)
    REDEAW_FN(STATE)
}

function fnImport(param){
    let file = param.target.files[0]
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = readSuccess
}

function fnExport(){
    let filename = 'gol.json'
    let jsonFile = JSON.stringify({'state': STATE})
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

    INIT_FN(STATE)
    REDEAW_FN(STATE)

    PLAY_PAUSE = oldPlayState
}

// init, mainLoop, main

function init(){
    // Add event listeners
    document.getElementById('playPauseButton').onclick = playPauseToggle
    document.getElementById('nextStepButton').onclick = nextStep
    document.getElementById('editButton').onclick = edit
    document.getElementById('clearButton').onclick = clear
    document.getElementById('chaosPatternButton').onclick = chaosPattern
    document.getElementById('gliderGunButton').onclick = gliderGun
    document.getElementById('zoomInButton').onclick = zoomIn
    document.getElementById('zoomOutButton').onclick = zoomOut
    document.getElementById('importButton').onchange = fnImport
    document.getElementById('exportButton').onclick = fnExport
    document.getElementById('changeDrawingAPIButton').onclick = changeDrawingAPI

    // generate initial state
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateChaosPattern(STATE)

    INIT_FN(STATE)
    REDEAW_FN(STATE)

}

function mainLoop(){
    if (PLAY_PAUSE){
        let startTime = Date.now()
        STATE = calculateNextState(STATE)
        REDEAW_FN(STATE)
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
