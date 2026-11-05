import { describe, expect, it } from 'vitest';
import { chatTopics, topicInfo } from './chatTopics';

describe('two customer AI modes', () => {
  it('offers consultation and store support', () => {
    expect(chatTopics.map(topic => topic.id)).toEqual(['PHONE_CONSULTATION', 'SHOP_SUPPORT']);
  });

  it('maps old comparison and general conversations to consultation', () => {
    expect(topicInfo('PHONE_COMPARISON').id).toBe('PHONE_CONSULTATION');
    expect(topicInfo('GENERAL_CHAT').id).toBe('PHONE_CONSULTATION');
  });
});
