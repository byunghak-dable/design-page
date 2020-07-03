let canvas // 화면 캡처할 떄 사용하는 켄버스
let canvasContext
let p5Canvas // 스케치할 떄 사용하는 켄버스
let p5Sketch

// -------------------------------- 웹페이지 수정 관련 --------------------------------

// 디자인 모드 on/off 관리하는 메소드
const toggleDesignMode = () => {
  document.designMode = document.designMode === 'off' ? 'on' : 'off'
  saveDesignModeState({ designMode: document.designMode })
  return { type: 'toggle-design-mode', payload: document.designMode }
}

const toggleP5mode = () => {
  let state = JSON.parse(getp5ModeState().payload)

  // state가 null이면 state를 true로 저장 후 return
  if (state == null) return savep5ModeState(true) // TODO : 예외처리 필요

  state = state ? false : true
  savep5ModeState(state)

  // toggle이 동작 중이면, p5 캔버스 실행, 아니면 제거
  if (state) {
    startP5()
  } else {
    if (p5Canvas) deleteCanvas() // p5Canvas가 존재하면 지우기
  }

  return { type: 'toggle-p5-mode', payload: state }
}

// 디자인 모드 설정 저장하는 메소드
const saveDesignModeState = payload => {
  sessionStorage.setItem('design-state', JSON.stringify(payload))
}

// 디자인 모드 설정을 불러오는 메소드
const getDesignModeState = () => {
  const state = sessionStorage.getItem('design-state')

  return {
    type: 'get-mode-state',
    payload: state ? JSON.parse(state) : { designMode: document.designMode },
  }
}

// 디자인 모드 설정 저장하는 메소드
const savep5ModeState = payload => {
  sessionStorage.setItem('p5-state', payload)
}

// 디자인 모드 설정을 불러오는 메소드
const getp5ModeState = () => {
  const state = sessionStorage.getItem('p5-state')

  return { type: 'get-p5-mode-state', payload: JSON.parse(state) }
}

// -------------------------------- p5 를 사용해 페이지 위에 마우스로 스케치 기능 관련 --------------------------------
const setUpP5 = sketch => {
  p5Sketch = sketch
  sketch.setup = () => {
    const wholePageHeight = document.body.clientHeight
    // const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
    p5Canvas = sketch.createCanvas(sketch.windowWidth, wholePageHeight) // 전체 body 영역에 canvas 생성
    p5Canvas.position(0, 0)
    p5Canvas.style('pointer-events', 'none')
    sketch.clear()
  }

  sketch.draw = () => {
    sketch.stroke(0)
    sketch.strokeWeight(4)
    if (sketch.mouseIsPressed) {
      sketch.line(sketch.mouseX, sketch.mouseY, sketch.pmouseX, sketch.pmouseY)
    }
  }
}

const startP5 = () => {
  new p5(setUpP5)
  p5Sketch.cursor('grab')
}

const pauseSketchMode = () => {
  p5Sketch.noLoop()
}

const deleteCanvas = () => {
  p5Canvas.remove()
}

// -------------------------------- 캡처 기능 관련 --------------------------------
// background.js 에게 현재 보이는 화면을 캡처해 달라고 메시지를 보냄
const captureVisibleTab = () => {
  chrome.runtime.sendMessage({ type: 'capture-visible-tab' })
}

// 캔버스에 이미지를 그리는 메소드
const drawImage = dataUri => {
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // canvas.height = document.body.clientHeight // TODO : 전체 페이지 저장하는 방법 찾기
    canvasContext = canvas.getContext('2d')
  }

  const image = new Image()

  image.onload = () => {
    canvasContext.drawImage(image, 0, 0)
    download()
  }
  image.src = dataUri
}

// 이미지를 다운 받는 메소드
const download = () => {
  const link = document.createElement('a')
  link.download = 'screenshot.png'
  link.href = canvas.toDataURL()
  link.click()
}

// -------------------------------- 실행 관련 --------------------------------
document.body.spellcheck = false // 웹 페이지 스펠 체크(빨간 줄) 안나오게 설정

// 메시지를 받아 그에 맞는 메소드를 호출하도록 하는 변수
const actions = {
  'toggle-design-mode': toggleDesignMode,
  'get-mode-state': getDesignModeState,
  'toggle-p5-mode': toggleP5mode,
  'get-p5-mode-state': getp5ModeState,
  'pause-sketch-mode': pauseSketchMode,
  'capture-tab': captureVisibleTab,
  'draw-image': drawImage,
}

// 메시지를 받아 그에 따른 필요한 작업을 하는 메소든
chrome.runtime.onMessage.addListener((request, sender, response) => {
  const reply = actions[request.type] && actions[request.type](request.payload)
  reply && response(reply)
})
