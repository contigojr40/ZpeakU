export const Streaming = {
  parseYouTubeId(input){
    if (!input) return '';
    const urlMatch = String(input).match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    return urlMatch ? urlMatch[1] : input;
  },
  render(videoId){
    const el = document.getElementById('yt-embed');
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1`;
    el.innerHTML = `<iframe width="100%" height="100%" frameborder="0" allowfullscreen src="${src}"></iframe>`;
  },
  renderChat(videoId){
    const chat = document.getElementById('yt-live-chat');
    chat.innerHTML = `
      <iframe width="100%" height="100%" frameborder="0"
        src="https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${location.hostname}">
      </iframe>`;
  },
  addComment({author,text}){
    const list = document.getElementById('comments-list');
    const node = document.createElement('div');
    node.className='comment';
    node.innerHTML = `<strong>${author}</strong><br/>${text}`;
    list.prepend(node);
  }
};