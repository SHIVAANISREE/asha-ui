// app/lib/services/chatService.js or wherever appropriate

export const sendChatMessage = async (message, message_id) => {
    try {
      console.log("message, message_id in service:", message, message_id);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, message_id }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
  
      const data = await response.json();
      console.log("response:", data);
      return data.response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return 'Sorry, something went wrong.';
    }
  };

// lib/api.ts

export const tagMessage = async (messageId, tag) => {
  const params = new URLSearchParams({ message_id: messageId, tag });
  console.log("tag in service:", params);

  const response = await fetch(`http://localhost:8000/tag-message?${params.toString()}`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to tag message');
  }

  return response.json();
};

export const removeTag = async (messageId) => {
  const params = new URLSearchParams({ message_id: messageId });

  const response = await fetch(`http://localhost:8000/remove-tag?${params.toString()}`, {
    method: 'POST'
  });

  if (!response.ok) throw new Error('Failed to remove tag');
  return response.json();
};

// services/tagService.ts

export const fetchTags = async () => {
  try {
    const response = await fetch(`http://localhost:8000/tags`, {
      method: 'GET'
    });
    const data = await response.json();

    const uniqueTags = Array.from(
      new Set(data.filter(tag => tag && tag.toLowerCase() !== 'null'))
    );

    return uniqueTags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
};


export const fetchMessagesByTag = async (tag) => {
  try {
    const response = await fetch(`http://localhost:8000/messages-by-tag?tag=${encodeURIComponent(tag)}`);
    const data = await response.json();
    console.log("fetched data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching messages by tag:', error);
    return [];
  }
};


  