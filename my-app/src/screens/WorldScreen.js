import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet,View,ImageBackground,Animated,ScrollView,Text,TouchableOpacity,Dimensions,Image } from 'react-native';

const PLANET_SIZE = 330;

const CITIES_CONFIG = [
    {id:'egypt',name:'Египет', xPosition: 430, topPosition: 240},
    {id:'china',name:'Китай', xPosition: 670, topPosition: 230},
    {id:'arctic',name:'Арктика', xPosition: 500, topPosition: 60},
];

export default function WorldScreen({navigation}) {
    const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
    const fadeAnim2 = useRef(new Animated.Value(0.5)).current;
    const [scale,setScale] = useState(1.0);
    const mapScrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
    }, []);

    const toggleZoom = () => {
        setScale((prev) => (prev === 1.0?1.5:1.0));
    };

    const handleSelectCity = (cityId) => {
        if (cityId === 'egypt') {
            navigation.navigate('EgyptScreen');
        } else if (cityId === 'china') {
            navigation.navigate('ChinaScreen',{ isFirstVisit: true });
        } else if (cityId === 'arctic') {
            navigation.navigate('ArcticScreen');
        }
    };

    return (
        <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background}>
        <Animated.View style={[styles.starLayer,{opacity:fadeAnim1}]}>
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>

        <Animated.View style={[styles.starLayer,{opacity:fadeAnim2, transform:[{scale:1.1},{rotate:'45deg'}]}]} pointerEvents="none">
            <ImageBackground source={require('../../assets/Darksky.png')} style={styles.background} />
        </Animated.View>

        <View style={styles.centerSpace}>
        <Animated.View style={[styles.planetCircle, {transform:[{scale:scale}]}]}>
        <ScrollView horizontal={false} bounces={false} contentContainerStyle={styles.verticalScrollContainer}>
            <ScrollView horizontal={true} bounces={false} showsHorizontalScrollIndicator={false}>
                    <View style={styles.mapWrapper}>
                        <Image
                            source={require('../../assets/mapWorld.png')}
                            style={styles.mapImage}
                            resizeMode="cover"
                            />
                            {CITIES_CONFIG.map((city) => (
                                <TouchableOpacity
                                key={city.id}
                                style={[styles.cityButton,{left: city.xPosition, top:city.topPosition}]}
                                onPress={() => handleSelectCity(city.id)}
                                >
                                    <View style={styles.cityPin}/>
                                    <Text style={styles.cityText}>{city.name}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                    </ScrollView>
                </ScrollView>
                    <View style={styles.planetOverlay} pointerEvents='none'/>
            </Animated.View>

            <TouchableOpacity style={styles.zoomButton} onPress={toggleZoom}>
                <Text style={styles.zoomButtonText}>
                    {scale === 1.0? 'Увеличить' : 'Отдалить'}
                </Text>
            </TouchableOpacity>
        </View>

            {/* Меню: только кнопка "Комната" */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.actionEmoji}>🏠</Text>
                  <Text style={styles.actionText}>Комната</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width:'100%', height: '100%', backgroundColor:'#0c0728' },
    starLayer: {...StyleSheet.absoluteFillObject },
    centerSpace: { flex: 1, alignItems: 'center', justifyContent:'center' },
    planetCircle: {
        width: PLANET_SIZE,
        height: PLANET_SIZE,
        borderRadius: PLANET_SIZE / 2,
        overflow: 'hidden',
        backgroundColor: '#1c3d5a',
        borderWidth: 4,
        borderColor: '#42a5f5',
        position: 'relative',
        shadowColor: '#3b82f6',
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    verticalScrollContainer: { height: PLANET_SIZE * 1.6 },
    mapImage: { width: '100%', height: '100%' },
    planetOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:'rgba(255, 255, 255, 0.08)',
        borderRadius:PLANET_SIZE/2,
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
    zoomButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
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
    actionButton: { alignItems: 'center', minWidth: 80 },
    actionEmoji: { fontSize: 26 },
    actionText: { fontSize: 13, color: '#000', marginTop: 4 },
    mapWrapper: {
        position: 'relative',
        width: PLANET_SIZE * 2.5,
        height: PLANET_SIZE * 1.6,
    },
    cityButton: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    cityPin: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ff4757',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#ff4757',
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 4,
    },
    cityText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: 'rgba(35, 34, 41, 0.71)',
        paddingVertical: 3,
        paddingHorizontal: 2,
        borderRadius: 6,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
});