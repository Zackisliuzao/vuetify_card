import { ref } from 'vue';

export function useSparkSocket() {
  const socket = ref<WebSocket | null>(null);
  const messages = ref<{ role: string; content: string; isStreaming?: boolean }[]>([]);
  const isConnected = ref(false);

  const connect = () => {
    socket.value = new WebSocket('wss://spark-api.xf-yun.com/v1.1/chat?authorization=YXBpX2tleT0iODFlNzVjNDcwMWZlYThkYWViZTgwOTNkZDM4OGNkNjIiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJlcXVlc3QtbGluZSIsIHNpZ25hdHVyZT0ieWJWMTNVOUl5N05maURzZXg5aHBqelRkU1hWeGdERUtzc3hseWZBUFFOUT0i&date=Wed%2C%2018%20Jun%202025%2008%3A42%3A43%20GMT&host=spark-api.xf-yun.com');

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log('WebSocket connected');
    };

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.header?.code === 0) {
        const content = data.payload.choices.text[0].content;
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].isStreaming) {
          messages.value[messages.value.length - 1].content += content;
        } else {
          messages.value.push({ role: 'assistant', content, isStreaming: true });
        }
      }
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      console.log('WebSocket closed');
    };

    socket.value.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
  };

  const sendMessage = (text: string) => {
    const userMsg = {
      header: {
        app_id: '580def54',
        uid: '1234'
      },
      parameter: {
        chat: {
          domain: 'lite',
          temperature: 0.5,
          max_tokens: 2048
        }
      },
      payload: {
        message: {
          text: [{ role: 'user', content: text }]
        }
      }
    };

    socket.value?.send(JSON.stringify(userMsg));
    messages.value.push({ role: 'user', content: text });
  };

  return {
    connect,
    sendMessage,
    messages,
    isConnected,
  };
}