import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useBank } from '../context/BankContext'; 

const SCAM_GAME_DATA = [
  {
    id: 1,
    senderName: '🤖 Администратор',
    avatarColor: '#e74c3c',
    chatHistory: [
      'Поздравляем! Ваш аккаунт выиграл 50 000 Робуксов! 👑🤩',
      'Чтобы мы зачислили их прямо сейчас, отправьте нам логин и пароль от вашего аккаунта для проверки.'
    ],
    options: [
      { id: 'a', text: 'Ура! Вот мой пароль: ProGamer2015, зачисляйте скорее!', isCorrect: false, feedback: '🚨 Ошибка! Администрация игр НИКОГДА не просит пароли. Теперь твой аккаунт украли! 😢' },
      { id: 'b', text: 'Я не верю вам. Официальные конкурсы проходят по-другому, пароль я не дам.', isCorrect: true, feedback: '🔥 Красава! Ты спас свой аккаунт. Мошенники охотятся за чужими профилями! +30 монет 💰' },
      { id: 'c', text: 'А можно скинуть пароль мамы вместо своего?', isCorrect: false, feedback: '🚨 Ни в коем случае! Так ты подставишь родителей и отдашь их карту мошенникам! ❌' }
    ]
  },
  {
    id: 2,
    senderName: '💬 Илюха ',
    avatarColor: '#3498db',
    chatHistory: [
      'Привет! Мы же с тобой одноклассники. Слушай, я тут в автобусе еду, карту дома забыл, мне надо срочно оплатить проезд!',
      'Скинь быстро 150 рублей на этот номер телефона, я вечером в школе отдам, плиз!'
    ],
    options: [
      { id: 'a', text: 'Да без проблем, лови денюжку, выручу друга!', isCorrect: false, feedback: '🚨 Ошибка! Аккаунт Илюхи взломали. Деньги улетели чужим людям, а настоящий Илья даже не знает об этом. 📉' },
      { id: 'b', text: 'Сначала я позвоню тебе по обычному телефону или спрошу кодовое слово, которое знаем только мы.', isCorrect: true, feedback: '🎯 В яблочко! При любых просьбах о деньгах в чате нужно ВСЕГДА перепроверять личность человека голосом! +30 монет 💰' },
      { id: 'c', text: 'У меня нет денег, иди пешком.', isCorrect: false, feedback: '🤖 Ну, грубовато, но мошеннику ты ничего не перевёл. Правда, если бы это реально был Илюха, он бы обиделся. Лучше перепроверить звонком!' }
    ]
  },
  {
    id: 3,
    senderName: '🏦 Главный Банк',
    avatarColor: '#2ecc71',
    chatHistory: [
      'Внимание! По вашей карте обнаружена подозрительная операция в Париже на 10 000 рублей!',
      'Чтобы заблокировать перевод, срочно напишите нам 4 цифры из СМС, которое сейчас пришло на ваш телефон!'
    ],
    options: [
      { id: 'a', text: 'Вот код: 4921! Быстрее блокируйте, пока всё не украли!', isCorrect: false, feedback: '🚨 Эпичный промах! Код из СМС — это был ключ для подтверждения перевода ВСЕХ твоих денег. Ты сам отдал их ворам! 💸' },
      { id: 'b', text: 'Я ничего не скажу. Я сам повешу трубку/закрою чат и зайду в официальное приложение банка.', isCorrect: true, feedback: '🏆 Мега-мозг! Роботы и сотрудники банка никогда не просят коды из СМС. Это золотое правило безопасности! +30 монет 💰' },
      { id: 'c', text: 'Подождите, я сейчас сфоткаю карту с двух сторон и пришлю вам.', isCorrect: false, feedback: '🚨 Кошмар! Фотография карты с обратным кодом (CVV) дает мошенникам полный доступ к покупкам в интернете! Никогда так не делай! ❌' }
    ]
  },
  {
    id: 4,
    senderName: '🏛️ Портал Госуслуги',
    avatarColor: '#004687',
    chatHistory: [
      'Внимание! Ваш личный кабинет заблокирован из-за подозрительной активности! ⚠️',
      'Для восстановления доступа прямо сейчас напишите шестизначный код восстановления, который пришёл вам в СМС.'
    ],
    options: [
      { id: 'a', text: 'Ой-ой! Вот код из СМС: 582910, скорее разблокируйте!', isCorrect: false, feedback: '🚨 Катастрофа! Код из СМС от Госуслуг — это ключ для смены пароля. Теперь мошенники украли аккаунт и могут набрать кредитов на родителей! 😭' },
      { id: 'b', text: 'Я ничего не скину в чат. Настоящие Госуслуги никогда не просят коды доступа в личной переписке.', isCorrect: true, feedback: '🏆 Мега-мозг! Служба поддержки никогда не запрашивает коды из СМС. Ты спас данные семьи! +30 монет 💰' },
      { id: 'c', text: 'А можно я вам вместо кода скину свой логин?', isCorrect: false, feedback: '🤖 Логин им не поможет, но вступать в переписку с фейками нельзя. Правильный шаг — сразу закрыть чат!' }
    ]
  },
  {
    id: 5,
    senderName: '👩‍🦱 Тётя Лена',
    avatarColor: '#9b59b6',
    chatHistory: [
      'Привет, солнышко! Представляешь, совсем замоталась и забыла твоей маме деньги за подарок перевести! 🤦‍♀️',
      'Сфоткай мне мамину карточку с двух сторон, пожалуйста, а я кину ей денюжку на подарок!'
    ],
    options: [
      { id: 'a', text: 'Да, тёть Лен, сейчас сфоткаю кошелёк и пришлю!', isCorrect: false, feedback: '🚨 Жёсткий косяк! Аккаунт тёти взломали. Фото карты с обратной стороны (где 3 цифры CVV) позволит ворам украсть ВСЕ деньги мамы! 💸' },
      { id: 'b', text: 'Я не буду фоткать карту. Я сам передам маме, чтобы она созвонилась с вами.', isCorrect: true, feedback: '🔥 Красава! Никому и никогда нельзя присылать фото банковских карт, даже если пишет близкий родственник. Аккаунт всегда могут взломать! +30 монет 💰' },
      { id: 'c', text: 'У мамы нет карты, давай я тебе свою скину.', isCorrect: false, feedback: '🚨 Плохая идея! Твою карту тоже обчистят. Мошенникам только это и нужно.' }
    ]
  },
  {
    id: 6,
    senderName: '👮 Капитан полиции Смирнов',
    avatarColor: '#2c3e50',
    chatHistory: [
      'Здравствуйте. Я из милиции. Ваши родители подозреваются в серьёзном нарушении закона. Они не оплатили налоги за прошлый месяц.',
      'Чтобы доказать их невиновность, вы должны тайно взять из дома наличные деньги или золото и передать нашему курьеру.'
    ],
    options: [
      { id: 'a', text: 'Хорошо, я сейчас найду где лежат деньги и вынесу на улицу, только не арестовывайте их! 😭', isCorrect: false, feedback: '🚨 Эпичный промах! Настоящая полиция никогда не требует выносить деньги или золото курьерам. Тебя жестоко обманули и обокрали! Никогда нельзя выносить деньги или другие ценные вещи из дома без разрешения родителей! 🛑' },
      { id: 'b', text: 'Я кладу трубку и сейчас же звоню родителям. Настоящая полиция так не делает.', isCorrect: true, feedback: '🎯 В яблочко! Мошенники специально пугают детей «полицией», чтобы те в панике отдали сбережения. Ты раскусил обман! +30 монет 💰' },
      { id: 'c', text: 'Подождите, я сейчас все сделаю.', isCorrect: false, feedback: '🤖 Ситуация страшная. Переписываться с ними нельзя — нужно срочно звонить маме или папе!' }
    ]
  },
  {
    id: 7,
    senderName: '🏥 Больница',
    avatarColor: '#e74c3c',
    chatHistory: [
      'Вашей маме стало очень плохо. Она только что поступила в больницу😭',
      'Ей срочно нужна платная операция, чтобы врачи помогли. Переведите 5000 рублей по номеру телефона врача!'
    ],
    options: [
      { id: 'a', text: 'Ужас какой! Ловите деньги, скорее спасите маму!! 🙏', isCorrect: false, feedback: '🚨 Кошмар! Это самый жестокий скам на эмоциях. С мамой всё в порядке, а твои деньги улетели ворам.Взрослые никогда не попросят помощи у ребенка! ❌' },
      { id: 'b', text: 'Я выхожу из чата и сам звоню маме или папе, чтобы проверить где она.', isCorrect: true, feedback: '🏆 Мега-мозг! Если пугают бедой с близкими — нужно первым же делом набрать им лично. Врачам на телефон деньги никто не собирает! +30 монет 💰' },
      { id: 'c', text: 'У меня нет 5000 рублей, могу скинуть 100 рублей и крабсбургер.', isCorrect: false, feedback: '🤖 Скаммер расстроится, но правильное действие — не шутить, а моментально проверить, всё ли в порядке с мамой, позвонив ей напрямую!' }
    ]
  },
    {
    id: 8,
    senderName: '❓ Неизвестный номер',
    avatarColor: '#e67e22',
    chatHistory: [
      'Привет! Слушай, мне тут скинули ссылку... 😱',
      'Посмотри, это реально ты на фотке?! Вот ссылка: click-photo-vk.ru/id8291'
    ],
    options: [
      { id: 'a', text: 'Ого, ничего себе! Ну-ка дай посмотрю, нажимаю на ссылку! 🖱️', isCorrect: false, feedback: '🚨 Катастрофа! Ссылка вела на фальшивый сайт. Как только ты перешёл, вирус украл пароли от твоих соцсетей и заблокировал телефон! 😭' },
      { id: 'b', text: 'Я не буду кликать. Это фишинг. Я заблокирую этот чат и никому не советую переходить.', isCorrect: true, feedback: '🏆 Мега-мозг! Запомни: никогда нельзя переходить по странным ссылкам от незнакомцев, даже если там интригующий текст! +30 монет 💰' },
      { id: 'c', text: 'Я перейду, но только с телефона друга, чтобы свой не заразить.', isCorrect: false, feedback: '🚨 Подстава! Так ты заразишь телефон друга, и мошенники украдут его данные. Переходить по таким ссылкам нельзя вообще ни с каких устройств! ❌' }
    ]
  },

];


export default function ScamGameScreen({ navigation }) {
  const bank = useBank();
  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isVisualCrash, setIsVisualCrash] = useState(false); 
  const [isFlashRed, setIsFlashRed] = useState(false);      
  const stage = SCAM_GAME_DATA[currentStage];
  const realBalance = bank?.balance ? Math.floor(bank.balance) : 0;
   const handleSelectOption = (option) => {
    if (showFeedback) return; 

    setSelectedOptionId(option.id);
    if (!option.isCorrect) {
      setIsVisualCrash(true); 
      setIsFlashRed(true);    
      setTimeout(() => {
        setIsVisualCrash(false);
        setIsFlashRed(false);
        setFeedbackMessage(option.feedback);
        setShowFeedback(true);
      }, 2500);

    } else {
      setFeedbackMessage(option.feedback);
      setShowFeedback(true);
      if (bank && typeof bank.addCoins === 'function') {
        bank.addCoins(30);
      }
    }
  };

    const handleNextStage = () => {
    if (currentStage < SCAM_GAME_DATA.length - 1) {
      setCurrentStage(currentStage + 1);
      setSelectedOptionId(null);
      setShowFeedback(false);
      setFeedbackMessage('');
    } else {
      Alert.alert(
        'Супер-защита активирована🛡️', 
        'Ты успешно прошёл все 8 чатов, раскусил уловку со ссылкой-ловушкой и спас кошелёк Финпига!', 
        [
          { text: 'В меню игр', onPress: () => navigation.navigate('MiniGamesScreen') }
        ]
      );
    }
  };


  if (!stage) return null;

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Выйти</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Анти-Скам Чат</Text>
        <Text style={[
          styles.scoreText, 
          isFlashRed && styles.scoreTextRed
        ]}>
          🪙 {isVisualCrash ? 0 : realBalance}
        </Text>
      </View>
      
      <View style={styles.phoneBody}>
        <View style={styles.contactBar}>
          <View style={[styles.avatar, { backgroundColor: stage.avatarColor }]} />
          <Text style={styles.contactName}>{stage.senderName}</Text>
        </View>
        <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 10 }}>
          {stage.chatHistory.map((msg, index) => (
            <View key={index} style={styles.messageBubble}>
              <Text style={styles.messageText}>{msg}</Text>
            </View>
          ))}
          {showFeedback && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      <View style={styles.actionArea}>
        {!showFeedback && !isVisualCrash ? (
          stage.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionButton}
              onPress={() => handleSelectOption(option)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))
        ) : (
          !isVisualCrash && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextStage}>
              <Text style={styles.nextButtonText}>
                {currentStage === SCAM_GAME_DATA.length - 1 ? 'Завершить' : 'Следующий чат'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  phoneBody: {
    flex: 1,
    margin: 15,
    backgroundColor: '#e5ddd5', // Классический цвет фона WhatsApp
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#34495e',
    overflow: 'hidden',
  },
  contactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  chatArea: {
    flex: 1,
  },
    scoreTextRed: {
    color: '#e74c3c', 
    fontSize: 18,     
  },
  messageBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 15,
    borderTopLeftRadius: 3,
    marginBottom: 10,
    maxWidth: '85%',
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  feedbackBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#34495e',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  actionArea: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'left',
  },
  nextButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
