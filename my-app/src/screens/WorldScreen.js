import React, {useEffect, useRef} from 'react';
import { StyleSheet,View,ImageBackground,Animated,ScrollView,Text,TouchableOpacity,Dimensions } from 'react-native';

// размер глобуса
const PLANET_SIZE = 280;

export default function WorldScreen({navigation}) {
    // анимация звезд
    const fadeAnim1 = useRef(new Animated.Value(0.4)).current;
    const fadeAnim2 = useRef(new Animated.Value(0.8)).current;
    //вращение земли анимация
    const mapScrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        //мерцание звездочек
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim1,{toValue:1,duration:1500,useNativeDriver:true}),
                Animated.timing(fadeAnim1,{toValue:0.3,duration:2000,useNativeDriver:true})
            ])
        ).start();
        
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim2, {toValue:0.2,duration:1200,useNativeDriver:true}),
                Animated.timing(fadeAnim2, {toValue:0.9,duration:1400,useNativeDriver:true})
            ])
        ).start();
        //вращение глобуса в разные стороны
        Animated.loop(
            Animated.sequence([
                Animated.timing(mapScrollAnim, {
                    toValue: -300,
                    duration: 20000,
                    useNativeDriver: true,
                }),
                Animated.timing(mapScrollAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    return (
        <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background}>
        <Animated.View style={[styles.starLayer,{opacity:fadeAnim1}]}>
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>
    
        <Animated.View style={[styles.starLayer,{opacity:fadeAnim2, transform:[{scale:1.05},{rotate:'90deg'}]}]}>
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>
        {/* Земля */}
        <ScrollView
            maximumZoomScale={3.0}
            minimumZoomScale={1.0}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.centerSpace}
            >
                <View style={styles.planetCircle}>
                    <Animated.Image
                        source={require('../../assets/mapWorld.png')}
                        style={[
                            styles.mapImage,
                            {transform: [{translateX: mapScrollAnim}]}
                        ]}
                    resizeMode="cover"
                    />
                    <View style={styles.planetOverlay} />
                </View>
            </ScrollView>

        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: {flex: 1, width:'100%',height: '100%',backgroundColor:'#0c0728'},
  starLayer: {...StyleSheet.absoluteFillObject },
  centerSpace: {flex: 1, alignItems: 'center', justifyContent:'center'},
  planetCircle: {
    width: PLANET_SIZE,
    height: PLANET_SIZE,
    borderRadius: PLANET_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1c3d5a',
    borderWidth: 3,
    borderColor: '#3b82f6',
    position: 'relative',
  },
  mapImage: {width: PLANET_SIZE * 3, height:PLANET_SIZE },
  planetOverlay: {...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255, 255, 255, 0.08)',borderRadius:PLANET_SIZE/2 },
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
  actionButton: {alignItems: 'center', minWidth: 80 },
  actionEmoji: {fontSize: 26 },
  actionText: {fontSize: 13, color: '#000', marginTop: 4 },
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