import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const useSocialData = (uid) => {
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribes = [];

    const unsubscribeMain = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (!docSnap.exists()) return;

      const userData = docSnap.data();
      const followers = userData.followers?.map(f => f.uid) || [];
      const following = userData.following?.map(f => f.uid) || [];

      const uniqueUids = Array.from(new Set([...followers, ...following]));

      const usersData = {};
      let loadedCount = 0;

      uniqueUids.forEach(userUid => {
        const unsub = onSnapshot(doc(db, 'users', userUid), (userDoc) => {
          if (userDoc.exists()) {
            usersData[userUid] = {
              uid: userUid,
              displayName: userDoc.data().displayName,
              photo: userDoc.data().photo,
            };

            loadedCount++;
            if (loadedCount >= uniqueUids.length) {
              const fullFollowers = followers.map(fUid => usersData[fUid]).filter(Boolean);
              const fullFollowing = following.map(fUid => usersData[fUid]).filter(Boolean);

              const friends = fullFollowers.filter(f =>
                fullFollowing.find(f2 => f2.uid === f.uid)
              );

              setFollowersList(fullFollowers);
              setFollowingList(fullFollowing);
              setFriendsList(friends);
              setLoading(false);
            }
          }
        });

        unsubscribes.push(unsub);
      });
    });

    // Cleanup all snapshots
    return () => {
      unsubscribeMain();
      unsubscribes.forEach(unsub => unsub());
    };
  }, [uid]);

  return { followersList, followingList, friendsList, loading };
};
