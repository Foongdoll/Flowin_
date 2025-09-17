export interface MockFriendUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
}

export type MockFriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface MockFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: MockFriendRequestStatus;
  createdAt: string;
}

export interface MockFriendRelation {
  id: string;
  memberIds: [string, string];
  createdAt: string;
}

const users: MockFriendUser[] = [
  { id: 'u1', username: 'pixel.mochi', displayName: 'Pixel Mochi', email: 'mochi@stardew.town' },
  { id: 'u2', username: 'luna.quest', displayName: 'Luna Quest', email: 'luna@stardew.town' },
  { id: 'u3', username: 'ember.knight', displayName: 'Ember Knight', email: 'ember@stardew.town' },
  { id: 'u4', username: 'celeste.dev', displayName: 'Celeste Dev', email: 'celeste@stardew.town' },
  { id: 'u5', username: 'willow.healer', displayName: 'Willow Healer', email: 'willow@stardew.town' },
];

const friendRequests: MockFriendRequest[] = [];
const friendships: MockFriendRelation[] = [];

export const friendStore = {
  users,
  friendRequests,
  friendships,
};

type RequestListener = (requests: MockFriendRequest[]) => void;
type FriendListener = (friends: MockFriendUser[]) => void;

const requestListeners = new Map<string, Set<RequestListener>>();
const friendListeners = new Map<string, Set<FriendListener>>();

export function addRequestListener(userId: string, listener: RequestListener) {
  const listeners = requestListeners.get(userId) ?? new Set<RequestListener>();
  listeners.add(listener);
  requestListeners.set(userId, listeners);
  listener(getPendingRequestsForUser(userId));
  return () => {
    listeners.delete(listener);
  };
}

export function addFriendListener(userId: string, listener: FriendListener) {
  const listeners = friendListeners.get(userId) ?? new Set<FriendListener>();
  listeners.add(listener);
  friendListeners.set(userId, listeners);
  listener(getFriendsForUser(userId));
  return () => {
    listeners.delete(listener);
  };
}

export function notifyRequestListeners(userId: string) {
  const listeners = requestListeners.get(userId);
  if (!listeners) return;
  const payload = getPendingRequestsForUser(userId);
  listeners.forEach((listener) => listener(payload));
}

export function notifyFriendListeners(userId: string) {
  const listeners = friendListeners.get(userId);
  if (!listeners) return;
  const payload = getFriendsForUser(userId);
  listeners.forEach((listener) => listener(payload));
}

export function getUserById(id: string) {
  return users.find((user) => user.id === id) ?? null;
}

export function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export function searchUsers(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return users.slice(0, 10);
  return users.filter((user) =>
    user.username.toLowerCase().includes(normalized) ||
    user.displayName.toLowerCase().includes(normalized) ||
    user.email.toLowerCase().includes(normalized)
  );
}

export function getPendingRequestsForUser(userId: string) {
  return friendRequests.filter(
    (request) => request.status === 'pending' && (request.senderId === userId || request.receiverId === userId),
  );
}

export function getFriendsForUser(userId: string) {
  const relations = friendships.filter((relation) => relation.memberIds.includes(userId));
  const friendIds = relations
    .map((relation) => relation.memberIds.find((memberId) => memberId !== userId))
    .filter((id): id is string => Boolean(id));
  return users.filter((user) => friendIds.includes(user.id));
}

export function createRequest(senderId: string, receiverId: string) {
  const request: MockFriendRequest = {
    id: '',
    senderId,
    receiverId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  friendRequests.push(request);
  notifyRequestListeners(receiverId);
  notifyRequestListeners(senderId);
  return request;
}

export function updateRequestStatus(requestId: string, status: MockFriendRequestStatus) {
  const request = friendRequests.find((item) => item.id === requestId);
  if (!request) return null;
  request.status = status;
  if (status === 'accepted') {
    friendships.push({
      id: request.id,
      memberIds: [request.senderId, request.receiverId],
      createdAt: new Date().toISOString(),
    });
    notifyFriendListeners(request.senderId);
    notifyFriendListeners(request.receiverId);
  }
  notifyRequestListeners(request.senderId);
  notifyRequestListeners(request.receiverId);
  return request;
}

export function resetFriendStore() {
  friendRequests.splice(0, friendRequests.length);
  friendships.splice(0, friendships.length);
}
