const replyBackToContent = (type, payload) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type, payload })
  })
}

chrome.runtime.onMessage.addListener((request, sender) => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUri => {
    replyBackToContent('draw-image', dataUri)
  })
})
