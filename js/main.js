const DIMENSION_X = 150 
const DIMENSION_Y = 150

let STATE = []
let PLAY_PAUSE = true
let ZOOM_LEVEL = 5

function* intGenerator(start, stop){
    while (start < stop) {
        yield start
        start += 1
    }
}

function drawTable(state) {
    let universe = document.getElementById('universe')
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

function calculateNextState(state){
    let newState = []
    let pos_x = 0
    state.forEach(row => {
        let newRow = []
        let pos_y = 0
        row.forEach(cell => {
            let n0 = (state[pos_x-1] && state[pos_x-1][pos_y-1]) || 0
            let n1 = (state[pos_x-1] && state[pos_x-1][pos_y]) || 0
            let n2 = (state[pos_x-1] && state[pos_x-1][pos_y+1]) || 0
            let n3 = (state[pos_x] && state[pos_x][pos_y-1]) || 0
            let n4 = (state[pos_x] && state[pos_x][pos_y+1]) || 0
            let n5 = (state[pos_x+1] && state[pos_x+1][pos_y-1]) || 0
            let n6 = (state[pos_x+1] && state[pos_x+1][pos_y]) || 0
            let n7 = (state[pos_x+1] && state[pos_x+1][pos_y+1]) || 0

            let aliveNeighbors = [n0, n1, n2, n3, n4, n5, n6, n7].reduce((a, b) => {return a+b})

            if (((cell === 0) && (aliveNeighbors !== 3)) || ((cell === 1)&&(aliveNeighbors <= 1)) || ((cell === 1)&&(aliveNeighbors >= 4))){
                newRow.push(0)
            } else {
                newRow.push(1)
            }
            pos_y += 1
        })
        newState.push(newRow)
        pos_x += 1
    })
    return newState
}

function playPauseToggle(){
    PLAY_PAUSE = !PLAY_PAUSE
}

function edit(){
    PLAY_PAUSE = false
}

function nextStep(){
    if (!PLAY_PAUSE){
        STATE = calculateNextState(STATE)
        redrawTable(STATE)
    }
}

function editCell(cell){
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

function clear(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    redrawTable(STATE)
}

function chaosPattern(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateChaosPattern(STATE)
    redrawTable(STATE)
}

function gliderGun(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateGliderGun(STATE)
    redrawTable(STATE)
}

function zoomIn(){
    ZOOM_LEVEL += 1
    rezoomTable(STATE)
}

function zoomOut(){
    ZOOM_LEVEL -= 1
    rezoomTable(STATE)
}


function readSuccess(content){
    let pattern = JSON.parse(content.target.result)['state']
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE =  generatePattern(STATE, pattern, 0, 0)
    redrawTable(STATE)
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

    // generate initial state
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateChaosPattern(STATE)

    // generate table
    drawTable(STATE)
    redrawTable(STATE)

    // add event listener to every cell
    let x = 0
    STATE.forEach( row => {
        let y = 0
        row.forEach( cell => {
            let elem = document.getElementById(`${x}_${y}`)
            elem.onclick = editCell
            y += 1
        })
        x += 1
    })
}

function main_loop(){
    if (PLAY_PAUSE){
        STATE = calculateNextState(STATE)
        redrawTable(STATE)
    }
    window.setTimeout(main_loop, 1)
}

function main(){
    init()
    main_loop()
}

main()
