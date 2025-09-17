import {
  MockFriendRequest,
  MockFriendRequestStatus,
  MockFriendUser,
  createRequest,
  getFriendsForUser,
  getPendingRequestsForUser,
  getUserByEmail,
  getUserById,
  resetFriendStore,
  searchUsers,
  updateRequestStatus,
} from './data';

const DEFAULT_DELAY = 280;

const wait = (ms: number = DEFAULT_DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

export async function restSearchUsers(query: string): Promise<MockFriendUser[]> {
  await wait();
  return searchUsers(query).map((user) => ({ ...user }));
}

export async function restSendFriendRequest(senderId: string, receiverId: string): Promise<MockFriendRequest> {
  await wait();
  if (senderId === receiverId) {
    throw new Error('자기 자신에게는 요청을 보낼 수 없습니다.');
  }
  const receiver = getUserById(receiverId);
  if (!receiver) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  const request = createRequest(senderId, receiverId);
  return { ...request };
}

export async function restSendFriendInviteByEmail(senderId: string, email: string): Promise<MockFriendRequest> {
  await wait();
  const receiver = getUserByEmail(email);
  if (!receiver) {
    throw new Error('해당 이메일로 등록된 모험가가 없어요.');
  }
  return restSendFriendRequest(senderId, receiver.id);
}

export async function restRespondFriendRequest(
  requestId: string,
  status: MockFriendRequestStatus,
): Promise<MockFriendRequest> {
  await wait();
  const updated = updateRequestStatus(requestId, status);
  if (!updated) {
    throw new Error('요청이 존재하지 않습니다.');
  }
  return { ...updated };
}

export async function restGetFriends(userId: string): Promise<MockFriendUser[]> {
  await wait();
  return getFriendsForUser(userId).map((user) => ({ ...user }));
}

export async function restGetPendingRequests(userId: string): Promise<MockFriendRequest[]> {
  await wait();
  return getPendingRequestsForUser(userId).map((req) => ({ ...req }));
}

export function restResetStore() {
  resetFriendStore();
}
