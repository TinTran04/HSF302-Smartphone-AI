import { useCallback, useState } from 'react';
import { defaultSkinId, skinById } from './skins';

const SKIN_KEY = 'smartphone-ai:assistant-skin';
const conversationKey = (userId: string) => `smartphone-ai:assistant-conversation:${userId}`;

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the widget still works for this page view.
  }
}

export function useAssistantSkin() {
  const [skinId, setSkinId] = useState(() => skinById(read(SKIN_KEY) ?? defaultSkinId).id);
  const choose = useCallback((id: string) => {
    const next = skinById(id).id;
    setSkinId(next);
    write(SKIN_KEY, next);
  }, []);
  return { skin: skinById(skinId), choose };
}

/** The widget keeps one ongoing conversation per account so it survives page changes. */
export function useAssistantConversation(userId: string | undefined) {
  const [state, setState] = useState(() => ({
    userId,
    id: userId ? read(conversationKey(userId)) : null,
  }));
  const current =
    state.userId === userId ? state.id : userId ? read(conversationKey(userId)) : null;
  const setId = useCallback(
    (id: string | null) => {
      if (userId) write(conversationKey(userId), id);
      setState({ userId, id });
    },
    [userId],
  );
  return [current, setId] as const;
}
