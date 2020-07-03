// costent로 메시지를 보내는 메소드 : dataUri를 보냄
const replyBackToContent = (type, payload) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type, payload })
  })
}

// MEMO : content 혹은 popup에서 메시지를 받는 메소드
// content 캡처 요청 메시지를 받고 png 형식으로 dataUri를 생성하여 다시 content로 보냄
chrome.runtime.onMessage.addListener((request, sender) => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUri => {
    replyBackToContent('draw-image', dataUri)
  })
})
