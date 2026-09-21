import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet,View,ImageBackground,Animated,ScrollView,Text,TouchableOpacity,Dimensions } from 'react-native';

// размер глобуса
const PLANET_SIZE = 330;

export default function WorldScreen({navigation}) {
    // анимация звезд
    const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
    const fadeAnim2 = useRef(new Animated.Value(0.5)).current;
    //вращение земли можно увеличить на андроиде не работало + добавила для него
    const [scale,setScale] = useState(1.0);
    const mapScrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        //мерцание звездочек
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim1,{toValue:0.9,duration:2500,useNativeDriver:true}),
                Animated.timing(fadeAnim1,{toValue:0.2,duration:2000,useNativeDriver:true})
            ])
        ).start();

        
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim2, {toValue:0.1,duration:1800,useNativeDriver:true}),
                Animated.timing(fadeAnim2, {toValue:0.8,duration:2200,useNativeDriver:true})
            ])
        ).start();

        //вращение глобуса в разные стороны
        //ребенок сам может крутить землю
        // Animated.loop(
        //     Animated.sequence([
        //         Animated.timing(mapScrollAnim, {
        //             toValue: -300,
        //             duration: 20000,
        //             useNativeDriver: true,
        //         }),
        //         Animated.timing(mapScrollAnim, {
        //             toValue: 0,
        //             duration: 0,
        //             useNativeDriver: true,
        //         })
        //     ])
        // ).start();
    }, []);

    //функция которая переключает масштаб
    const toggleZoom = () => {
        setScale((prev) => (prev === 1.0?1.5:1.0));
    };

    return (
        <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background}>
        <Animated.View style={[styles.starLayer,{opacity:fadeAnim1}]}>
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>
    
        <Animated.View style={[styles.starLayer,{opacity:fadeAnim2, transform:[{scale:1.1},{rotate:'45deg'}]}]}>
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>

        {/* центр */}
        <View style={styles.centerSpace}>
        {/* Земля - масштабирование*/}
        <Animated.View
            style={[styles.planetCircle, {transform:[{scale:scale}]}]}>
        <ScrollView
            horizontal={false} bounces={false} contentContainerStyle={styles.verticalScrollContainer}
            >
                {/* // maximumZoomScale={3.0}
            // minimumZoomScale={1.0}
            // showsHorizontalScrollIndicator={false}
            // showsVerticalScrollIndicator={false}
            // contentContainerStyle={styles.centerSpace} */}
                {/* ручное вращение а не автоматическое */}
            <ScrollView horizontal={true} bounces={false}>
                {/* <View style={styles.planetCircle}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}> */}
                        <Animated.Image
                            source={require('../../assets/mapWorld.png')}
                            style={styles.mapImage}
                                // {transform: [{translateX: mapScrollAnim}]}
                            resizeMode="cover"/>
                    </ScrollView>
                </ScrollView>
                    <View style={styles.planetOverlay} pointerEvents='none'/>
            </Animated.View>
            {/* кнопка увеличения */}
            <TouchableOpacity style={styles.zoomButton} onPress={toggleZoom}>
                <Text style={styles.zoomButtonText}>
                    {scale === 1.0? 'Увеличить' : 'Отдалить'}
                </Text>
            </TouchableOpacity>
        </View>



            {/* Меню */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setOpenMenu('tasks')}>
                  <Text style={styles.actionEmoji}>📋</Text>
                  <Text style={styles.actionText}>Задания</Text>
                        </TouchableOpacity>
                        {/* КНОПКА С ЗЕМЛЕЙ путешествие по странам */}
                        <TouchableOpacity 
                          style={styles.actionButton} 
                          onPress={() => navigation.navigate('World')}>
                          <Text style={styles.actionEmoji}>🌍</Text>
                          <Text style={styles.actionText}>Мир</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setOpenMenu('room')}>
                          <Text style={styles.actionEmoji}>🏠</Text>
                          <Text style={styles.actionText}>Комната</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
                  
    );
}
const styles = StyleSheet.create({
    background: {
        flex: 1, 
        width:'100%',
        height: '100%',
        backgroundColor:'#0c0728'
    },
  starLayer: {...StyleSheet.absoluteFillObject },
  centerSpace: {
    flex: 1, alignItems: 'center', 
    justifyContent:'center'
    },

  planetCircle: {
    width: PLANET_SIZE,
    height: PLANET_SIZE,
    borderRadius: PLANET_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1c3d5a',
    borderWidth: 4,
    borderColor: '#42a5f5',
    position: 'relative',
    //тень
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    },
    verticalScrollContainer: {
    height: PLANET_SIZE * 1.6, 
  },
  mapImage: {
    width: PLANET_SIZE * 2.5,  
    height: PLANET_SIZE * 1.6, 
  },
  planetOverlay: {...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(255, 255, 255, 0.08)',
    borderRadius:PLANET_SIZE/2 
    },
  zoomButton: {
    position: 'absolute',
    bottom: 120, 
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
     },
  actionButton: {
    alignItems: 'center', 
    minWidth: 80 
    },
  actionEmoji: {fontSize: 26 },
  actionText: {
    fontSize: 13, 
    color: '#000', 
    marginTop: 4 
    },
  activeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  }
})