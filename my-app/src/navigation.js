// ─── Навигация ───
// Возврат в «Гостиную» из мини-игр. Сбрасываем стек, чтобы игра
// не оставалась под низом и кнопка «Назад» не возвращала в неё.
export function backToLivingRoom(navigation) {
  navigation.reset({
    index: 1,
    routes: [{ name: 'Home' }, { name: 'LivingRoomScreen' }],
  });
}
