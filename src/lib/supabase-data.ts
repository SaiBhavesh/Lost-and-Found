// Mock data layer — no Supabase, all data lives in localStorage
import {
  mockItems, mockMatches, mockClaims, mockNotifications, mockUsers,
} from '@/data/mock-data';
import type {
  Item, ItemType, ItemStatus, ItemCategory,
  Match, Claim, Notification, User,
  Conversation, ChatMessage, ConversationWithMeta,
} from '@/lib/constants';

// ─── Persistent store helpers ─────────────────────────────────────────────────

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed once per browser (if key not set yet)
function seed<T>(key: string, data: T[]) {
  if (!localStorage.getItem(key)) save(key, data);
}

seed('laf_items', mockItems);
seed('laf_matches', mockMatches);
seed('laf_claims', mockClaims);
seed('laf_notifications', mockNotifications);
seed('laf_users', mockUsers.map(u => ({ ...u, password: 'password123' })));
seed('laf_conversations', []);
seed('laf_messages', []);

const getItems = () => load<Item>('laf_items', mockItems);
const setItems = (d: Item[]) => save('laf_items', d);

const getMatches = () => load<Match>('laf_matches', mockMatches);
const setMatches = (d: Match[]) => save('laf_matches', d);

const getClaims = () => load<Claim>('laf_claims', mockClaims);
const setClaims = (d: Claim[]) => save('laf_claims', d);

const getNotifications = () => load<Notification>('laf_notifications', mockNotifications);
const setNotifications = (d: Notification[]) => save('laf_notifications', d);

const getUsers = () => load<User>('laf_users', mockUsers);

const getConversations = () => load<Conversation>('laf_conversations', []);
const setConversations = (d: Conversation[]) => save('laf_conversations', d);

const getMessages = () => load<ChatMessage>('laf_messages', []);
const setMessages = (d: ChatMessage[]) => save('laf_messages', d);

const delay = () => new Promise(r => setTimeout(r, 80));

// ─── Items ────────────────────────────────────────────────────────────────────

export interface ItemFilters {
  type?: ItemType;
  category?: ItemCategory;
  status?: ItemStatus;
  location?: string;
  reporterId?: string;
  query?: string;
  includeClosed?: boolean;
}

export async function fetchItems(filters: ItemFilters = {}): Promise<Item[]> {
  await delay();
  let items = getItems();

  if (filters.type) items = items.filter(i => i.type === filters.type);
  if (filters.category) items = items.filter(i => i.category === filters.category);
  if (filters.status) items = items.filter(i => i.status === filters.status);
  if (filters.location) items = items.filter(i => i.location === filters.location);
  if (filters.reporterId) items = items.filter(i => i.reporterId === filters.reporterId);
  if (!filters.includeClosed && filters.status !== 'closed') {
    items = items.filter(i => i.status !== 'closed');
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q),
    );
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchItemById(id: string): Promise<Item | null> {
  await delay();
  return getItems().find(i => i.id === id) ?? null;
}

export async function createItem(item: Omit<Item, 'id' | 'createdAt' | 'status'>): Promise<Item> {
  await delay();
  const newItem: Item = {
    ...item,
    id: crypto.randomUUID(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  const items = [newItem, ...getItems()];
  setItems(items);

  // Auto-generate matches
  const matches = getMatches();
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const candidates = items.filter(i => i.type === oppositeType && i.category === item.category && i.status === 'open' && i.id !== newItem.id);
  for (const c of candidates) {
    const score = 50 + (c.location === item.location ? 30 : 0);
    const reason = `Same category. ${c.location === item.location ? 'Same location.' : ''}`.trim();
    const match: Match = {
      id: crypto.randomUUID(),
      lostItemId: item.type === 'lost' ? newItem.id : c.id,
      foundItemId: item.type === 'found' ? newItem.id : c.id,
      score,
      reason,
      status: 'pending',
    };
    matches.push(match);
  }
  setMatches(matches);

  return newItem;
}

export async function updateItemStatus(id: string, status: ItemStatus): Promise<void> {
  await delay();
  setItems(getItems().map(i => i.id === id ? { ...i, status } : i));
}

export async function deleteItem(id: string): Promise<void> {
  await delay();
  setItems(getItems().filter(i => i.id !== id));
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function uploadItemPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function fetchMatches(itemId?: string): Promise<Match[]> {
  await delay();
  let matches = getMatches();
  if (itemId) matches = matches.filter(m => m.lostItemId === itemId || m.foundItemId === itemId);
  return matches;
}

export async function updateMatchStatus(id: string, status: 'accepted' | 'dismissed'): Promise<void> {
  await delay();
  setMatches(getMatches().map(m => m.id === id ? { ...m, status } : m));
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export async function fetchClaims(itemId?: string): Promise<Claim[]> {
  await delay();
  let claims = getClaims();
  if (itemId) claims = claims.filter(c => c.itemId === itemId);
  return claims;
}

export async function createClaim(claim: { itemId: string; claimerId: string; verificationAnswers: Record<string, string> }): Promise<Claim> {
  await delay();
  const newClaim: Claim = {
    id: crypto.randomUUID(),
    ...claim,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  setClaims([...getClaims(), newClaim]);
  return newClaim;
}

export async function updateClaimStatus(id: string, status: 'approved' | 'rejected', reviewedBy: string): Promise<void> {
  await delay();
  setClaims(getClaims().map(c => c.id === id ? { ...c, status, reviewedBy } : c));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  await delay();
  return getNotifications()
    .filter(n => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay();
  setNotifications(getNotifications().map(n => n.id === id ? { ...n, read: true } : n));
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<User | null> {
  await delay();
  return getUsers().find(u => u.id === userId) ?? null;
}

export async function fetchProfiles(): Promise<User[]> {
  await delay();
  return getUsers();
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function getOrCreateConversation(meId: string, otherId: string): Promise<Conversation> {
  await delay();
  const [userA, userB] = orderedPair(meId, otherId);
  const convos = getConversations();
  const existing = convos.find(c => c.userA === userA && c.userB === userB);
  if (existing) return existing;

  const now = new Date().toISOString();
  const newConvo: Conversation = {
    id: crypto.randomUUID(),
    userA,
    userB,
    lastMessageAt: now,
    lastReadA: now,
    lastReadB: now,
    createdAt: now,
  };
  setConversations([...convos, newConvo]);
  return newConvo;
}

export async function fetchConversations(meId: string): Promise<ConversationWithMeta[]> {
  await delay();
  const convos = getConversations().filter(c => c.userA === meId || c.userB === meId);
  const messages = getMessages();

  return convos
    .map(c => {
      const otherUserId = c.userA === meId ? c.userB : c.userA;
      const myLastRead = c.userA === meId ? c.lastReadA : c.lastReadB;
      const convoMsgs = messages.filter(m => m.conversationId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const last = convoMsgs[0];
      const unread = !!last && last.senderId !== meId && last.createdAt > myLastRead;
      return { ...c, otherUserId, unread, preview: last?.body, previewSenderId: last?.senderId };
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  await delay();
  return getMessages()
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function sendMessage(input: { conversationId: string; senderId: string; body: string; itemId?: string }): Promise<ChatMessage> {
  await delay();
  const now = new Date().toISOString();
  const msg: ChatMessage = { id: crypto.randomUUID(), ...input, createdAt: now };
  setMessages([...getMessages(), msg]);
  setConversations(getConversations().map(c =>
    c.id === input.conversationId ? { ...c, lastMessageAt: now } : c,
  ));
  return msg;
}

export async function markConversationRead(conversationId: string, meId: string): Promise<void> {
  await delay();
  const now = new Date().toISOString();
  setConversations(getConversations().map(c => {
    if (c.id !== conversationId) return c;
    return c.userA === meId ? { ...c, lastReadA: now } : { ...c, lastReadB: now };
  }));
}
