import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { Auth, db } from '../Services/firebaseConfig';
import { toggleLikedSong } from '../Utils/likedsFunction';

const LikeButton = ({ song }) => {
  const userId = Auth.currentUser.uid;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const scale = new Animated.Value(1);

  useEffect(() => {
    const songRef = doc(db, 'musics', song.id);
    const unsubscribe = onSnapshot(songRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const likedBy = data.likedBy || [];
        setLikesCount(likedBy.length);
        setLiked(likedBy.includes(userId));
      }
    });

    return () => unsubscribe();
  }, [song.id]);

  const handleToggleLike = () => {
    // animação pop
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    toggleLikedSong(song, setLiked, setLikesCount);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={handleToggleLike}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <AntDesign
            name={liked ? 'heart' : 'hearto'}
            size={36}
            color={liked ? 'red' : 'white'}
          />
        </Animated.View>
      </Pressable>
      <Text style={{ color: 'white', marginTop: 4 }}>{likesCount}</Text>
    </View>
  );
};

export default LikeButton;
