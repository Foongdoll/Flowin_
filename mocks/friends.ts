export type {
  MockFriendUser as User,
  MockFriendRequest as FriendRequest,
  MockFriendRelation as Friendship,
  MockFriendRequestStatus,
} from './friends/data';

export {
  friendStore,
  getUserById as getMockUserById,
  searchUsers as rawSearchUsers,
  getFriendsForUser as rawGetFriends,
  getPendingRequestsForUser as rawGetPending,
} from './friends/data';


export {
  restSearchUsers as searchUsers,
  restSendFriendRequest as sendFriendRequest,
  restSendFriendInviteByEmail as sendFriendInviteByEmail,
  restRespondFriendRequest as respondToFriendRequest,
  restGetFriends as getFriends,
  restGetPendingRequests as getPendingRequests,
  restResetStore as resetFriendMocks,
} from './friends/restStub';

export {
  subscribeToFriendRequests,
  subscribeToFriendList,
  firebaseSendFriendRequest,
  firebaseSendFriendInviteByEmail,
  firebaseRespondFriendRequest,
  firebaseFetchFriends,
  firebaseFetchPending,
} from './friends/firebaseMock';
