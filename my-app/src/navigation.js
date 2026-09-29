
export function backToLivingRoom(navigation) {
  navigation.reset({
    index: 1,
    routes: [{ name: 'Home' }, { name: 'LivingRoomScreen' }],
  });
}
