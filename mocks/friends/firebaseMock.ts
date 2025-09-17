import {
  MockFriendRequest,
  MockFriendRequestStatus,
  MockFriendUser,
  addFriendListener,
  addRequestListener,
  createRequest,
  getFriendsForUser,
  getPendingRequestsForUser,
  getUserByEmail,
  getUserById,
  updateRequestStatus,
} from './data';

export type MockUnsubscribe = () => void;

const wait = (ms: number = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export function subscribeToFriendRequests(
  userId: string,
  callback: (requests: MockFriendRequest[]) => void,
): MockUnsubscribe {
  return addRequestListener(userId, (requests) => callback(requests.map((item) => ({ ...item }))));
}

export function subscribeToFriendList(
  userId: string,
  callback: (friends: MockFriendUser[]) => void,
): MockUnsubscribe {
  return addFriendListener(userId, (friends) => callback(friends.map((item) => ({ ...item }))));
}

export async function firebaseSendFriendRequest(senderId: string, receiverId: string) {
  await wait();
  const receiver = getUserById(receiverId);
  if (!receiver) {
    throw new Error('대상을 찾을 수 없습니다.');
  }
  return createRequest(senderId, receiverId);
}

export async function firebaseSendFriendInviteByEmail(senderId: string, email: string) {
  await wait();
  const receiver = getUserByEmail(email);
  if (!receiver) {
    throw new Error('해당 이메일 모험가를 찾을 수 없어요.');
  }
  return createRequest(senderId, receiver.id);
}

export async function firebaseRespondFriendRequest(
  requestId: string,
  status: MockFriendRequestStatus,
) {
  await wait();
  const updated = updateRequestStatus(requestId, status);
  if (!updated) {
    throw new Error('요청이 존재하지 않습니다.');
  }
  return updated;
}

export async function firebaseFetchFriends(userId: string) {
  await wait();
  return getFriendsForUser(userId);
}

export async function firebaseFetchPending(userId: string) {
  await wait();
  return getPendingRequestsForUser(userId);
}
