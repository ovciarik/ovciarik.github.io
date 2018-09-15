let STATE = []
let PLAY_PAUSE = false
let DIMENSION_X = 120
let DIMENSION_Y = 120

let ZOOM_LEVEL = 10

function* intGenerator(start, stop){
  while (start < stop) {
      yield start;
      start += 1
  }
}

function tableCreate(state) {
    let universe = document.getElementById('universe');
    let tbl = document.createElement('table');

    tbl.style.border = '1px solid #2a2b2f';
    tbl.style['border-collapse'] = 'collapse';
    posX = 0

    // for (let pos_x of intGenerator(0, 100)){
    state.forEach(row => {
        let posY = 0
        let tr = document.createElement('tr');
        row.forEach(_ => {
            let td = document.createElement('td');
            td.style['height'] = `${ZOOM_LEVEL}px`
            td.style['min-width'] = `${ZOOM_LEVEL}px`
            td.style.border = '1px solid #2a2b2f'
            td.style.background = '#4f4f57'
            td.id = `${posX}_${posY}`
            tr.appendChild(td)
            posY += 1
        })
        tbl.appendChild(tr)
        posX += 1
  })
  universe.appendChild(tbl)
}

function redrawTable(state){
    let pos_x = 0
    for (row of state){
        let pos_y = 0
        for (cell of row){
            let elem = document.getElementById(`${pos_x}_${pos_y}`);
            if (cell === 0) {
                elem.style.background = '#4f4f57'
            } else {
                elem.style.background = '#2e8b57'
            }
            pos_y += 1
        }
        pos_x += 1
    }
    return state
}

function rezoomTable(state){
    let pos_x = 0
    for (row of state){
        let pos_y = 0
        for (cell of row){
            let elem = document.getElementById(`${pos_x}_${pos_y}`);
            elem.style['height'] = `${ZOOM_LEVEL}px`
            elem.style['min-width'] = `${ZOOM_LEVEL}px`
            pos_y += 1
        }
        pos_x += 1
    }
    return state

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getNewState(state){
    let newState = []
    let pos_x = 0
    for (row of state){
        let newRow = []
        let pos_y = 0
        for (cell of row){
            n0 = (state[pos_x-1] && state[pos_x-1][pos_y-1]) || 0
            n1 = (state[pos_x-1] && state[pos_x-1][pos_y]) || 0
            n2 = (state[pos_x-1] && state[pos_x-1][pos_y+1]) || 0
            n3 = (state[pos_x] && state[pos_x][pos_y-1]) || 0
            n4 = (state[pos_x] && state[pos_x][pos_y+1]) || 0
            n5 = (state[pos_x+1] && state[pos_x+1][pos_y-1]) || 0
            n6 = (state[pos_x+1] && state[pos_x+1][pos_y]) || 0
            n7 = (state[pos_x+1] && state[pos_x+1][pos_y+1]) || 0

            aliveNeighbors = [n0, n1, n2, n3, n4, n5, n6, n7].reduce((a, b) => {return a+b})

            if (((cell === 0) && (aliveNeighbors !== 3)) || ((cell === 1)&&(aliveNeighbors <= 1)) || ((cell === 1)&&(aliveNeighbors >= 4))){
                newRow.push(0)
            } else {
                newRow.push(1)
            }
            pos_y += 1
        }
        newState.push(newRow)
        pos_x += 1
    }
    return newState
}

function main_loop(){
    if (PLAY_PAUSE){
        STATE = getNewState(STATE)
        redrawTable(STATE)
    }

    window.setTimeout(main_loop, 16)
}


function playPauseToggle(){
    PLAY_PAUSE = !PLAY_PAUSE
    // console.log(PLAY_PAUSE)
}

function nextStep(){
    if (!PLAY_PAUSE){
        STATE = getNewState(STATE)
        redrawTable(STATE)
    }
}

function editCell(cell){
    // STATE
    // console.log(cell)
    // console.log()
    let posX = cell['target']['id'].split('_')[0]
    let posY = cell['target']['id'].split('_')[1]
    console.log(STATE[posX][posY])
    let currentState = STATE[posX][posY]
    if (currentState === 1) {
        STATE[posX][posY] = 0
    } else {
        STATE[posX][posY] = 1
    }

    redrawTable(STATE)

    console.log(STATE[posX][posY])

}

function generateInitialState(width, height){
    table = []
    for (let x of intGenerator(0, width)){
        row = []
        for (let y of intGenerator(0, height)){
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
    let offsetX = 50
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

function init(){
    STATE = generateInitialState(DIMENSION_X, DIMENSION_Y)
    STATE = generateChaosPattern(STATE)
    // console.log(STATE)
    playPauseButton = document.getElementById('playPauseButton')
    playPauseButton.onclick = playPauseToggle

    nextStepButton = document.getElementById('nextStepButton')
    nextStepButton.onclick = nextStep

    clearButton = document.getElementById('clearButton')
    clearButton.onclick = clear

    chaosPatternButton = document.getElementById('chaosPatternButton')
    chaosPatternButton.onclick = chaosPattern

    gliderGunButton = document.getElementById('gliderGunButton')
    gliderGunButton.onclick = gliderGun

    zoomInButton = document.getElementById('zoomInButton')
    zoomInButton.onclick = zoomIn

    zoomOutButton = document.getElementById('zoomOutButton')
    zoomOutButton.onclick = zoomOut

    tableCreate(STATE)
    redrawTable(STATE)

    let pos_x = 0
    for (row of STATE){
        let pos_y = 0
        for (cell of row){
            let elem = document.getElementById(`${pos_x}_${pos_y}`);
            elem.onclick = editCell
            pos_y += 1
        }
        pos_x += 1
    }
    // add event listenr to every cell

}

function main(){
    init()
    main_loop()
}

main()
